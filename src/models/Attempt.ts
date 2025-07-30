import { Schema, model, Document, Types } from 'mongoose';

export interface IAttempt extends Document {
  problemId: Types.ObjectId;
  date: Date;
  timeSpent: number;
  success: boolean;
  difficulty: 'easy' | 'good' | 'hard' | 'failed';
  notes?: string;
  createdAt: Date;
}

const attemptSchema = new Schema<IAttempt>({
  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0
  },
  success: {
    type: Boolean,
    required: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'good', 'hard', 'failed']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

attemptSchema.index({ problemId: 1, date: -1 });
attemptSchema.index({ date: -1 });

export const Attempt = model<IAttempt>('Attempt', attemptSchema);