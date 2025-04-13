import express from 'express';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointmentController.js';
import { protect, checkPermissions } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get all appointments (with optional filters)
router.get(
  '/',
  checkPermissions(['view_appointments']), // Ensure the user has the required permission
  getAppointments
);

// Get a single appointment by ID
router.get(
  '/:id',
  checkPermissions(['view_appointments']),
  getAppointmentById
);

// Create a new appointment
router.post(
  '/',
  checkPermissions(['manage_appointments']),
  createAppointment
);

// Update an appointment
router.put(
  '/:id',
  checkPermissions(['manage_appointments']),
  updateAppointment
);

// Delete an appointment
router.delete(
  '/:id',
  checkPermissions(['manage_appointments']),
  deleteAppointment
);

export default router;
