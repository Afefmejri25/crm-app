import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
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
    filePath: {
      type: String,
      required: [true, "Le chemin du fichier est requis"],
    },
    fileType: {
      type: String,
      required: [true, "Le type de fichier est requis"],
    },
    fileSize: {
      type: Number,
      required: [true, "La taille du fichier est requise"],
      min: 0,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Le client est requis'],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
documentSchema.index({ title: "text", description: "text" });
documentSchema.index({ client: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ fileType: 1 });
documentSchema.index({ tags: 1 });

const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);
export default Document;
