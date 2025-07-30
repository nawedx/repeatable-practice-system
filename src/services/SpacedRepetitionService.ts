import { addDays, isToday, startOfDay } from 'date-fns';
import { Problem, Attempt, Schedule, ISchedule, IProblem, IAttempt } from '../models';
import { Types } from 'mongoose';

export type DifficultyRating = 'easy' | 'good' | 'hard' | 'failed';

export class SpacedRepetitionService {
  
  static calculateNextReview(
    currentSchedule: ISchedule,
    rating: DifficultyRating,
    timeSpent: number,
    estimatedTime: number
  ): { nextReview: Date; interval: number; easeFactor: number; repetitions: number } {
    let { interval, easeFactor, repetitions } = currentSchedule;
    
    const timeRatio = timeSpent / estimatedTime;
    
    switch (rating) {
      case 'easy':
        easeFactor = Math.min(4.0, easeFactor + 0.1);
        interval = Math.max(1, Math.floor(interval * easeFactor * 1.3));
        repetitions += 1;
        break;
        
      case 'good':
        if (timeRatio <= 1.5) {
          easeFactor = Math.max(1.3, easeFactor);
          interval = repetitions === 0 ? 1 : repetitions === 1 ? 3 : Math.floor(interval * easeFactor);
          repetitions += 1;
        } else {
          easeFactor = Math.max(1.3, easeFactor - 0.1);
          interval = Math.max(1, Math.floor(interval * 0.8));
        }
        break;
        
      case 'hard':
        easeFactor = Math.max(1.3, easeFactor - 0.15);
        interval = Math.max(1, Math.floor(interval * 0.6));
        break;
        
      case 'failed':
        easeFactor = Math.max(1.3, easeFactor - 0.2);
        interval = 1;
        repetitions = 0;
        break;
    }
    
    const nextReview = addDays(startOfDay(new Date()), interval);
    
    return { nextReview, interval, easeFactor, repetitions };
  }
  
  static async getTodaysProblems(): Promise<(IProblem & { schedule: ISchedule })[]> {
    const today = startOfDay(new Date());
    
    const schedules = await Schedule.find({
      nextReview: { $lte: today }
    }).populate('problemId');
    
    return schedules
      .filter(schedule => schedule.problemId)
      .map(schedule => {
        const problem = schedule.problemId as any;
        return {
          ...problem.toObject(),
          schedule: schedule.toObject()
        };
      });
  }
  
  static async getUpcomingProblems(days: number = 7): Promise<(IProblem & { schedule: ISchedule })[]> {
    const today = startOfDay(new Date());
    const futureDate = addDays(today, days);
    
    const schedules = await Schedule.find({
      nextReview: { $gt: today, $lte: futureDate }
    }).populate('problemId').sort({ nextReview: 1 });
    
    return schedules
      .filter(schedule => schedule.problemId)
      .map(schedule => {
        const problem = schedule.problemId as any;
        return {
          ...problem.toObject(),
          schedule: schedule.toObject()
        };
      });
  }
  
  static async recordAttempt(
    problemId: string,
    timeSpent: number,
    rating: DifficultyRating,
    notes?: string
  ): Promise<void> {
    const problem = await Problem.findById(problemId);
    if (!problem) {
      throw new Error('Problem not found');
    }
    
    const success = rating !== 'failed';
    
    const attempt = new Attempt({
      problemId: new Types.ObjectId(problemId),
      date: new Date(),
      timeSpent,
      success,
      difficulty: rating,
      notes
    });
    
    await attempt.save();
    
    let schedule = await Schedule.findOne({ problemId: new Types.ObjectId(problemId) });
    
    if (!schedule) {
      schedule = new Schedule({
        problemId: new Types.ObjectId(problemId),
        nextReview: new Date(),
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5
      });
    }
    
    const nextSchedule = this.calculateNextReview(
      schedule,
      rating,
      timeSpent,
      problem.estimatedTime
    );
    
    schedule.nextReview = nextSchedule.nextReview;
    schedule.interval = nextSchedule.interval;
    schedule.easeFactor = nextSchedule.easeFactor;
    schedule.repetitions = nextSchedule.repetitions;
    schedule.lastReviewed = new Date();
    
    await schedule.save();
  }
  
  static async addProblem(
    title: string,
    difficulty: 'easy' | 'medium' | 'hard',
    topics: string[],
    estimatedTime: number,
    leetcodeUrl?: string
  ): Promise<IProblem> {
    const problem = new Problem({
      title,
      difficulty,
      topics,
      estimatedTime,
      leetcodeUrl
    });
    
    await problem.save();
    
    const schedule = new Schedule({
      problemId: problem._id,
      nextReview: startOfDay(new Date()),
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5
    });
    
    await schedule.save();
    
    return problem;
  }
}