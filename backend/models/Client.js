import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    contactName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    region: { type: String, required: true },
    annualRevenue: { type: Number, required: true },
    tags: { type: [String], default: [] },
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
