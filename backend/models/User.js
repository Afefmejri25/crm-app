import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const defaultPermissions = {
  admin: [
    'view_dashboard',
    'manage_clients',
    'view_clients',
    'manage_appointments',
    'view_appointments',
    'manage_calls',
    'view_calls',
    'manage_documents',
    'view_documents',
    'view_statistics',
    'manage_users',
    'view_notifications',
    'manage_notifications'
  ],
  agent: [
    'view_dashboard',
    'view_clients',
    'view_appointments',
    'manage_calls',
    'view_calls',
    'view_documents',
    'view_notifications'
  ]
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "agent"],
      default: "agent",
    },
    permissions: {
      type: [String],
      default: function() {
        return defaultPermissions[this.role] || [];
      }
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    }
  },
  { timestamps: true }
);

// Hash the password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if the model already exists before defining it
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;