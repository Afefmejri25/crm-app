import express from 'express';
import { loginUser, registerUser, getCurrentUser, getAgents } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Login route
router.post('/login', loginUser);

// Register route
router.post('/register', registerUser);

// Get current user profile
router.get('/me', protect, getCurrentUser); // Ensure this route is protected and correctly implemented

// Get all agents (admin only)
router.get('/agents', protect, admin, getAgents);

export default router;
