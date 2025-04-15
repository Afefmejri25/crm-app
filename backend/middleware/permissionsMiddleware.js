export const checkPermissions = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user || !req.permissions) {
      console.error("checkPermissions: No user or permissions found.");
      return res.status(403).json({ message: "Access denied. No permissions found." });
    }

    const hasPermission = requiredPermissions.some((permission) =>
      req.permissions.includes(permission)
    );

    if (!hasPermission) {
      console.error("checkPermissions: Missing required permissions.", {
        requiredPermissions,
        userPermissions: req.permissions,
      });
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }

    next();
  };
};
