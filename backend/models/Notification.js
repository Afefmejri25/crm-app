import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['document', 'appointment', 'call', 'reminder'], required: true },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }], // Array of recipients
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Add index for faster queries
notificationSchema.index({ recipients: 1, createdAt: -1 });
notificationSchema.index({ createdBy: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
