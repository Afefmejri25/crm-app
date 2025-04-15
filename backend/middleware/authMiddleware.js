import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    next();
  } catch (error) {
    console.error("protect: Error verifying token:", error.message || error);
    res.status(401).json({ message: "Not authorized" });
  }
};

export const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.error("authorize: User role not authorized.", {
        userRole: req.user.role,
        requiredRoles: roles,
      });
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }
    next();
  };
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    console.error("admin: Access denied. User is not an admin.", { userRole: req.user.role });
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

export const checkPermissions = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      console.error("checkPermissions: No user or permissions found.");
      return res.status(403).json({ message: "Access denied. No permissions found." });
    }

    const hasPermission = requiredPermissions.some((permission) => {
      if (permission === "manage_own_clients" || permission === "manage_own_appointments") {
        return req.user.role === "agent"; // Ensure agents can manage their own clients and appointments
      }
      return req.user.permissions.includes(permission);
    });

    if (!hasPermission) {
      console.error("checkPermissions: Missing required permissions.", {
        requiredPermissions,
        userPermissions: req.user.permissions,
      });
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }

    next();
  };
};
