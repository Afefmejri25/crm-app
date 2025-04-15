import express from "express";
import {
  getCalls,
  createCall,
  updateCall,
  deleteCall,
} from "../controllers/callController.js";
import { protect, checkPermissions } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get all calls (Admin sees all, Agent sees their own)
router.get("/", checkPermissions(["view_calls"]), getCalls);

// Create a new call (Admin and Agent roles allowed)
router.post("/", checkPermissions(["manage_calls"]), createCall);

// Update a call
router.put("/:id", checkPermissions(["manage_calls", "manage_own_calls"]), updateCall);

// Delete a call (Admin only)
router.delete("/:id", checkPermissions(["manage_calls", "manage_own_calls"]), deleteCall);

export default router;
