import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Le message est requis"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["document", "appointment", "call", "reminder"],
      required: [true, "Le type de notification est requis"],
    },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Ensure this matches the User model
        required: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
notificationSchema.index({ title: "text", message: "text" });
notificationSchema.index({ type: 1 });
notificationSchema.index({ recipients: 1 });

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export default Notification;
