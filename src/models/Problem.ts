import { Schema, model, Document } from 'mongoose';

export interface IProblem extends Document {
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
  estimatedTime: number;
  leetcodeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const problemSchema = new Schema<IProblem>({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard']
  },
  topics: [{
    type: String,
    required: true,
    trim: true
  }],
  estimatedTime: {
    type: Number,
    required: true,
    min: 1
  },
  leetcodeUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^https:\/\/leetcode\.com\/problems\//.test(v);
      },
      message: 'Invalid LeetCode URL format'
    }
  }
}, {
  timestamps: true
});

problemSchema.index({ topics: 1 });
problemSchema.index({ difficulty: 1 });

export const Problem = model<IProblem>('Problem', problemSchema);