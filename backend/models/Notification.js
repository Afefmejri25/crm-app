import mongoose from "mongoose";

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
      enum: ["info", "warning", "error", "success"],
      required: [true, "Le type de notification est requis"],
    },
    recipients: {
      type: [
        {
          id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
          name: { type: String, required: true },
          email: { type: String, required: true },
        },
      ],
      default: "all", // Default to "all" if no recipients are specified
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
  },
  {
    timestamps: true, // Automatically add `createdAt` and `updatedAt` fields
  }
);

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export default Notification;
