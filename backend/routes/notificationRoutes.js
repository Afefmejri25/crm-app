import express from 'express';
import {
  getNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get all notifications for the logged-in user
router.get('/', getNotifications);

// Create a new notification
router.post('/', createNotification);

// Mark a notification as read
router.put('/:id/read', markAsRead);

// Delete a notification
router.delete('/:id', deleteNotification);

export default router;
