import mongoose from 'mongoose';

const callSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Le client est requis'],
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'agent est requis'],
    },
    date: {
      type: Date,
      required: [true, 'La date est requise'],
    },
    result: {
      type: String,
      enum: ['answered', 'no_answer', 'busy', 'callback', 'wrong_number' , 'not_interested'],
      required: [true, 'Le résultat est requis'],
    },
    notes: {
      type: String,
      trim: true,
    },
    callbackDate: {
      type: Date,
      validate: {
        validator: function(value) {
          return !this.callbackDate || value > this.date;
        },
        message: 'La date de rappel doit être après la date de l\'appel'
      }
    },
    duration: {
      type: Number, // in seconds
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
callSchema.index({ client: 1 });
callSchema.index({ agent: 1 });
callSchema.index({ date: 1 });
callSchema.index({ result: 1 });

const Call = mongoose.models.Call || mongoose.model('Call', callSchema);

export default Call;
