import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  loginUser,
  getUsers,
  getUserProfile,
  registerUser,
  getCurrentUser,
  getAgents, // Ensure this matches the controller
} from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/login", loginUser);
router.post("/register", registerUser);

// Protected routes
router.get("/me", protect, getCurrentUser);
router.get("/profile", protect, getUserProfile);

// Admin-only routes
router.get("/users", protect, admin, getUsers);
router.get("/agents", protect, admin, getAgents); // Ensure this route is included

export default router;
