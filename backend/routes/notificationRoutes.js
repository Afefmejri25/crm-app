import express from 'express';
import {
  getNotifications,
  createNotification,
  deleteNotification,
  markAsRead
} from '../controllers/notificationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// Get all notifications for the logged-in user
router.get('/', getNotifications);

// Create a new notification (admin only)
router.post('/', admin, createNotification);

// Mark a notification as read
router.put('/:id/read', markAsRead);

// Delete a notification (admin or recipient)
router.delete('/:id', deleteNotification);

export default router;
