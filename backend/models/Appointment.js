import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startTime: {
      type: Date,
      required: [false, "L'heure de début est requise"],
    },
    
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Le client est requis"],
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "L'agent est requis"],
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    location: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Validate that endTime is after startTime
appointmentSchema.pre("save", function (next) {
  console.log("Appointment pre-save hook: Validating startTime and endTime"); // Debugging log
  if (this.endTime <= this.startTime) {
    console.error("Appointment pre-save hook: Validation failed - endTime is before startTime"); // Debugging log
    next(new Error("L'heure de fin doit être après l'heure de début"));
  } else {
    console.log("Appointment pre-save hook: Validation passed"); // Debugging log
    next();
  }
});

// Add indexes for better query performance
appointmentSchema.index({ client: 1 });
appointmentSchema.index({ agent: 1 });
appointmentSchema.index({ startTime: 1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);

export default Appointment;
