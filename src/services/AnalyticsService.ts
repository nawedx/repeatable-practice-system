import { startOfDay, subDays, format } from 'date-fns';
import { Problem, Attempt, Schedule } from '../models';

export interface ProgressStats {
  totalProblems: number;
  completedToday: number;
  streakDays: number;
  averageTimeImprovement: number;
  topicBreakdown: { [topic: string]: { attempted: number; success: number } };
  difficultyBreakdown: { easy: number; medium: number; hard: number };
  upcomingCount: number;
}

export class AnalyticsService {
  
  static async getProgressStats(): Promise<ProgressStats> {
    const today = startOfDay(new Date());
    
    const totalProblems = await Problem.countDocuments();
    
    const todayAttempts = await Attempt.find({
      date: { $gte: today },
      success: true
    }).countDocuments();
    
    const streak = await this.calculateStreak();
    
    const timeImprovement = await this.calculateTimeImprovement();
    
    const topicStats = await this.getTopicBreakdown();
    
    const difficultyStats = await this.getDifficultyBreakdown();
    
    const upcomingCount = await Schedule.countDocuments({
      nextReview: { $lte: today }
    });
    
    return {
      totalProblems,
      completedToday: todayAttempts,
      streakDays: streak,
      averageTimeImprovement: timeImprovement,
      topicBreakdown: topicStats,
      difficultyBreakdown: difficultyStats,
      upcomingCount
    };
  }
  
  private static async calculateStreak(): Promise<number> {
    let streak = 0;
    let currentDate = startOfDay(new Date());
    
    while (true) {
      const hasAttempts = await Attempt.findOne({
        date: { $gte: currentDate, $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000) },
        success: true
      });
      
      if (!hasAttempts) {
        break;
      }
      
      streak++;
      currentDate = subDays(currentDate, 1);
    }
    
    return streak;
  }
  
  private static async calculateTimeImprovement(): Promise<number> {
    const thirtyDaysAgo = subDays(new Date(), 30);
    
    const pipeline = [
      {
        $match: {
          date: { $gte: thirtyDaysAgo },
          success: true
        }
      },
      {
        $lookup: {
          from: 'problems',
          localField: 'problemId',
          foreignField: '_id',
          as: 'problem'
        }
      },
      {
        $unwind: '$problem'
      },
      {
        $group: {
          _id: '$problemId',
          attempts: {
            $push: {
              timeSpent: '$timeSpent',
              estimatedTime: '$problem.estimatedTime',
              date: '$date'
            }
          }
        }
      },
      {
        $match: {
          'attempts.1': { $exists: true }
        }
      }
    ];
    
    const results = await Attempt.aggregate(pipeline);
    
    if (results.length === 0) return 0;
    
    let totalImprovement = 0;
    let count = 0;
    
    results.forEach(result => {
      const attempts = result.attempts.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const first = attempts[0];
      const last = attempts[attempts.length - 1];
      
      const firstRatio = first.timeSpent / first.estimatedTime;
      const lastRatio = last.timeSpent / last.estimatedTime;
      
      const improvement = ((firstRatio - lastRatio) / firstRatio) * 100;
      totalImprovement += improvement;
      count++;
    });
    
    return count > 0 ? totalImprovement / count : 0;
  }
  
  private static async getTopicBreakdown(): Promise<{ [topic: string]: { attempted: number; success: number } }> {
    const pipeline = [
      {
        $lookup: {
          from: 'problems',
          localField: 'problemId',
          foreignField: '_id',
          as: 'problem'
        }
      },
      {
        $unwind: '$problem'
      },
      {
        $unwind: '$problem.topics'
      },
      {
        $group: {
          _id: '$problem.topics',
          attempted: { $sum: 1 },
          success: {
            $sum: {
              $cond: ['$success', 1, 0]
            }
          }
        }
      }
    ];
    
    const results = await Attempt.aggregate(pipeline);
    
    const breakdown: { [topic: string]: { attempted: number; success: number } } = {};
    results.forEach(result => {
      breakdown[result._id] = {
        attempted: result.attempted,
        success: result.success
      };
    });
    
    return breakdown;
  }
  
  private static async getDifficultyBreakdown(): Promise<{ easy: number; medium: number; hard: number }> {
    const breakdown = await Problem.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const result = { easy: 0, medium: 0, hard: 0 };
    breakdown.forEach(item => {
      result[item._id as keyof typeof result] = item.count;
    });
    
    return result;
  }
}