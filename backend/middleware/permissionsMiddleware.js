export const checkPermissions = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user || !Array.isArray(req.user.permissions)) {
      console.error("checkPermissions: No user or permissions found.");
      return res.status(403).json({ message: "Access denied. No permissions found." });
    }

    const hasPermission = requiredPermissions.some((permission) =>
      req.user.permissions.includes(permission)
    );

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
