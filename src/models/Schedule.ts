import { Schema, model, Document, Types } from 'mongoose';

export interface ISchedule extends Document {
  problemId: Types.ObjectId;
  nextReview: Date;
  interval: number;
  repetitions: number;
  easeFactor: number;
  lastReviewed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema<ISchedule>({
  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
    unique: true
  },
  nextReview: {
    type: Date,
    required: true,
    default: Date.now
  },
  interval: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  repetitions: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  easeFactor: {
    type: Number,
    required: true,
    default: 2.5,
    min: 1.3,
    max: 4.0
  },
  lastReviewed: {
    type: Date
  }
}, {
  timestamps: true
});

scheduleSchema.index({ nextReview: 1 });
scheduleSchema.index({ problemId: 1 });

export const Schedule = model<ISchedule>('Schedule', scheduleSchema);