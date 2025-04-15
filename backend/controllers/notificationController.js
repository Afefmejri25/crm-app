import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Get all notifications for the logged-in user
export const getNotifications = async (req, res, next) => {
  try {
    const filter = req.user.role === "admin" ? {} : { recipients: req.user._id };
    const notifications = await Notification.find(filter)
      .populate("recipients", "name email") // Correctly populate the recipients field
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    next(error); // Pass error to centralized error handler
  }
};

// Create a new notification
export const createNotification = async (req, res, next) => {
  const { title, message, type, recipients } = req.body;

  // Validate required fields
  if (!title || !message || !type || !recipients || !Array.isArray(recipients)) {
    return res.status(400).json({
      message: "Title, message, type, and recipients array are required.",
    });
  }

  // Filter out null/undefined values and validate recipients array
  const validRecipients = recipients.filter(
    (recipient) => recipient && typeof recipient === "string" && recipient.length > 0
  );

  if (validRecipients.length === 0) {
    return res.status(400).json({
      message: "At least one valid recipient is required.",
    });
  }

  // Validate notification type
  const validTypes = ["document", "appointment", "call", "reminder"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      message: "Invalid notification type. Must be one of: document, appointment, call, reminder",
    });
  }

  try {
    console.log("createNotification: Incoming data:", { title, message, type, recipients }); // Debugging log

    // Verify all recipients exist
    const users = await User.find({ _id: { $in: validRecipients } });
    if (users.length !== validRecipients.length) {
      return res.status(400).json({ message: "One or more recipients do not exist." });
    }

    const notification = new Notification({
      title,
      message,
      type,
      recipients: validRecipients,
      createdBy: req.user._id,
    });

    const createdNotification = await notification.save();
    console.log("createNotification: Notification created:", createdNotification); // Debugging log

    // Populate the fields before sending response
    await createdNotification.populate("recipients", "name email");
    await createdNotification.populate("createdBy", "name email");

    res.status(201).json(createdNotification);
  } catch (error) {
    next(error); // Pass error to centralized error handler
  }
};

// Mark a notification as read
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      res.status(404);
      throw new Error("Notification not found.");
    }

    if (!notification.recipients.includes(req.user._id)) {
      res.status(403);
      throw new Error("Not authorized to mark this notification as read.");
    }

    // Update the isRead field for the specific user
    notification.isRead = true;
    const updatedNotification = await notification.save();

    // Populate the fields before sending response
    await updatedNotification.populate("recipients", "name email");
    await updatedNotification.populate("createdBy", "name email");

    res.json(updatedNotification);
  } catch (error) {
    next(error); // Pass error to centralized error handler
  }
};

// Delete a notification
export const deleteNotification = async (req, res, next) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findById(id);

    if (!notification) {
      res.status(404);
      throw new Error("Notification not found.");
    }

    // Check if the user is the creator of the notification
    if (notification.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this notification.");
    }

    await notification.deleteOne();
    res.json({ message: "Notification removed successfully." });
  } catch (error) {
    next(error); // Pass error to centralized error handler
  }
};
