import Notification from "../models/Notification.js";

// Fetch all notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({}).sort({ createdAt: -1 });
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des notifications." });
  }
};

// Create a new notification
export const createNotification = async (req, res) => {
  const { title, message, type, recipients } = req.body;

  if (!title || !message || !type || !recipients) {
    return res.status(400).json({ message: "Tous les champs sont obligatoires." });
  }

  try {
    const notification = await Notification.create({
      title,
      message,
      type,
      recipients,
      isRead: false,
      createdBy: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
      },
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de la notification." });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification introuvable." });
    }

    res.status(200).json({ message: "Notification supprimée avec succès." });
  } catch (error) {
    console.error("Error in deleteNotification:", error); // Log the error for debugging
    res.status(500).json({ message: "Erreur lors de la suppression de la notification." });
  }
};

// Mark a notification as read/unread
export const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;
  const { isRead } = req.body;

  try {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead },
      { new: true, runValidators: true } // Return the updated document and run validators only on updated fields
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification introuvable." });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error); // Log the error for debugging
    res.status(500).json({ message: "Erreur lors de la mise à jour de la notification." });
  }
};
