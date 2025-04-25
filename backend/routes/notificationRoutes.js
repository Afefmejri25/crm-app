import express from "express";
import {
  getNotifications,
  createNotification,
  deleteNotification,
  markNotificationAsRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getNotifications) // Fetch all notifications
  .post(protect, createNotification); // Create a new notification

router.route("/:id")
  .delete(protect, deleteNotification) // Delete a notification
  .patch(protect, markNotificationAsRead); // Mark a notification as read/unread

export default router;
