import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, unique: true }, // Ensure companyName is unique
    email: { 
      type: String, 
      required: false, 
      unique: true, 
      sparse: true // Ensure unique index ignores null or empty values
    },
    contactName: { type: String, required: true }, // Ensure contactName is unique
    phone: { type: String, required: false }, // Optional phone field
    address: { type: String, required: true },
    region: { type: String, required: true },
    annualRevenue: { type: Number, required: false },
    leadPriority: { type: String, enum: ['Hot', 'Warm', 'Cold'], default: 'Cold' },
    pipelineStage: {
      type: String,
      enum: ['New', 'Contacted', 'Interested', 'Converted'],
      default: 'New',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Client = mongoose.models.Client || mongoose.model('Client', clientSchema);

export default Client;
