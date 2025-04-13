import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Get all notifications for the logged-in user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipients: req.user._id })
      .populate('recipients', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
};

// Create a new notification
export const createNotification = async (req, res) => {
  const { title, message, type, recipients } = req.body;

  // Validate required fields
  if (!title || !message || !type || !recipients || !Array.isArray(recipients)) {
    return res.status(400).json({ 
      message: "Title, message, type, and recipients array are required." 
    });
  }

  // Filter out null/undefined values and validate recipients array
  const validRecipients = recipients.filter(recipient => 
    recipient && typeof recipient === 'string' && recipient.length > 0
  );

  if (validRecipients.length === 0) {
    return res.status(400).json({ 
      message: "At least one valid recipient is required." 
    });
  }

  // Validate notification type
  const validTypes = ['document', 'appointment', 'call', 'reminder'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ 
      message: "Invalid notification type. Must be one of: document, appointment, call, reminder" 
    });
  }

  try {
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
    
    // Populate the fields before sending response
    await createdNotification.populate('recipients', 'name email');
    await createdNotification.populate('createdBy', 'name email');
    
    res.status(201).json(createdNotification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ 
      message: "Failed to create notification. Please try again later.",
      error: error.message 
    });
  }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (!notification.recipients.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to mark this notification as read' });
    }

    // Update the isRead field for the specific user
    notification.isRead = true;
    const updatedNotification = await notification.save();
    
    // Populate the fields before sending response
    await updatedNotification.populate('recipients', 'name email');
    await updatedNotification.populate('createdBy', 'name email');
    
    res.json(updatedNotification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    // Check if the user is the creator of the notification
    if (notification.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this notification." });
    }

    await notification.deleteOne();
    res.json({ message: "Notification removed successfully." });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Failed to delete notification. Please try again later." });
  }
};
