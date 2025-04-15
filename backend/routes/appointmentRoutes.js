import express from "express";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointmentController.js";
import { protect, checkPermissions } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get all appointments (Admin sees all, Agent sees their own)
router.get("/", checkPermissions(["view_appointments"]), getAppointments);

// Create a new appointment (Admin and Agent roles allowed)
router.post("/", checkPermissions(["manage_appointments", "manage_own_appointments"]), createAppointment);

// Update an appointment
router.put("/:id", checkPermissions(["manage_appointments", "manage_own_appointments"]), updateAppointment);

// Delete an appointment
router.delete("/:id", checkPermissions(["manage_appointments", "manage_own_appointments"]), deleteAppointment);

export default router;
