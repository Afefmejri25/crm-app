import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found.' });
      }

      next();
    } catch (error) {
      console.error("protect: Error verifying token:", error.message || error); // Debugging log
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token.' });
  }
};

// Check if user has required permissions
export const checkPermissions = (requiredPermissions) => (req, res, next) => {
  try {
    const userPermissions = req.user.permissions || [];
    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasPermission) {
      console.error("checkPermissions: User lacks required permissions:", requiredPermissions); // Debugging log
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }

    next();
  } catch (error) {
    console.error("checkPermissions: Error validating permissions:", error.message || error); // Debugging log
    res.status(500).json({ message: "Failed to validate permissions." });
  }
};

// Check if user has admin role
export const adminOnly = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Non autorisé - Utilisateur non authentifié',
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Accès refusé - Réservé aux administrateurs',
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({
      message: 'Erreur lors de la vérification du rôle administrateur',
    });
  }
};

// Simple admin role check
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accès réservé aux administrateurs' });
  }
};

// Simple agent role check
export const agent = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'agent')) {
    next();
  } else {
    res.status(403).json({ message: 'Accès réservé aux agents et administrateurs' });
  }
};
