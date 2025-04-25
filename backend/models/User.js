import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const defaultPermissions = {
  admin: [
    'view_dashboard',
    'manage_clients',
    'manage_own_clients', // Ensure this permission exists for admins
    'view_clients',
    'manage_appointments',
    'view_appointments',
    'manage_calls',
    'view_calls',
    'manage_documents',
    'manage_own_documents', // Ensure this permission exists for admins
    'view_documents',
    'view_statistics',
    'manage_users',
    'view_notifications',
    'manage_notifications',
    'view_emails',     // Admin can view emails
    'view_all_emails', // Admin can view all emails
    'send_emails',     // Admin can send emails
    'delete_emails'    // Admin can delete emails
  ],
  agent: [
    'view_dashboard',
    'view_clients',
    'manage_appointments', // Added permission for managing appointments
    'view_appointments',
    'manage_calls',
    'view_calls',
    'manage_own_clients', // Ensure this permission exists for agents
    'view_documents',
    'manage_own_documents', // Ensure this permission exists for agents
    'view_notifications',
    'view_own_emails', // Agent can view their own emails
    'send_emails'      // Agent can send emails
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

export default mongoose.model("User", userSchema); // Use `export default`