import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        console.error("Authentication Error: User not found.");
        return res.status(401).json({ message: "Utilisateur non trouvé." });
      }

      console.log("Authenticated User:", req.user); // Log authenticated user
      next();
    } catch (error) {
      console.error("Authentication Error:", error.message || error);
      return res.status(401).json({ message: "Non autorisé." });
    }
  } else {
    console.error("Authentication Error: No token provided.");
    return res.status(401).json({ message: "Non autorisé, aucun token fourni." });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    console.error("admin: Access denied. User is not an admin.", { userRole: req.user?.role });
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

export const checkPermissions = (requiredPermissions) => (req, res, next) => {
  try {
    const userPermissions = req.user.permissions || []; // Ensure permissions are loaded from the user object

    // Check if the user has at least one of the required permissions
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({ message: "Vous n'avez pas la permission de télécharger des documents." });
    }

    next();
  } catch (error) {
    console.error("Error in checkPermissions middleware:", error.message || error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
