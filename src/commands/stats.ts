import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { AnalyticsService } from '../services/AnalyticsService';
import { connectDatabase } from '../utils/database';

export const statsCommand = new Command('stats')
  .description('Show your progress statistics')
  .action(async () => {
    try {
      await connectDatabase();
      
      const stats = await AnalyticsService.getProgressStats();
      
      console.log(chalk.blue.bold('📊 Your DSA Progress Statistics'));
      console.log();
      
      // Overall Stats
      const overallTable = new Table({
        head: [chalk.cyan('Metric'), chalk.cyan('Value')]
      });
      
      overallTable.push(
        ['Total Problems', chalk.white(stats.totalProblems.toString())],
        ['Completed Today', chalk.green(stats.completedToday.toString())],
        ['Current Streak', chalk.yellow(`${stats.streakDays} days`)],
        ['Upcoming Reviews', chalk.blue(stats.upcomingCount.toString())],
        ['Avg Time Improvement', 
          stats.averageTimeImprovement > 0 ? 
            chalk.green(`+${stats.averageTimeImprovement.toFixed(1)}%`) :
            stats.averageTimeImprovement < 0 ?
              chalk.red(`${stats.averageTimeImprovement.toFixed(1)}%`) :
              chalk.gray('No data')
        ]
      );
      
      console.log(overallTable.toString());
      console.log();
      
      // Difficulty Breakdown
      if (stats.totalProblems > 0) {
        console.log(chalk.blue.bold('📈 Problems by Difficulty'));
        const difficultyTable = new Table({
          head: [chalk.cyan('Difficulty'), chalk.cyan('Count'), chalk.cyan('Percentage')]
        });
        
        Object.entries(stats.difficultyBreakdown).forEach(([difficulty, count]) => {
          const percentage = ((count / stats.totalProblems) * 100).toFixed(1);
          const difficultyColor = 
            difficulty === 'easy' ? chalk.green :
            difficulty === 'medium' ? chalk.yellow :
            chalk.red;
          
          difficultyTable.push([
            difficultyColor(difficulty.charAt(0).toUpperCase() + difficulty.slice(1)),
            chalk.white(count.toString()),
            chalk.gray(`${percentage}%`)
          ]);
        });
        
        console.log(difficultyTable.toString());
        console.log();
      }
      
      // Topic Breakdown
      const topicEntries = Object.entries(stats.topicBreakdown);
      if (topicEntries.length > 0) {
        console.log(chalk.blue.bold('🏷️  Performance by Topic'));
        const topicTable = new Table({
          head: [
            chalk.cyan('Topic'),
            chalk.cyan('Attempted'),
            chalk.cyan('Success'),
            chalk.cyan('Success Rate')
          ]
        });
        
        topicEntries
          .sort(([,a], [,b]) => b.attempted - a.attempted)
          .slice(0, 10)
          .forEach(([topic, data]) => {
            const successRate = data.attempted > 0 ? (data.success / data.attempted * 100).toFixed(1) : '0.0';
            const rateColor = parseFloat(successRate) >= 80 ? chalk.green : 
                             parseFloat(successRate) >= 60 ? chalk.yellow : chalk.red;
            
            topicTable.push([
              chalk.white(topic),
              chalk.blue(data.attempted.toString()),
              chalk.green(data.success.toString()),
              rateColor(`${successRate}%`)
            ]);
          });
        
        console.log(topicTable.toString());
        console.log();
      }
      
      // Motivation Messages
      if (stats.streakDays > 0) {
        console.log(chalk.green(`🔥 Amazing! You're on a ${stats.streakDays}-day streak!`));
      }
      
      if (stats.completedToday > 0) {
        console.log(chalk.blue(`💪 Great work completing ${stats.completedToday} problem${stats.completedToday > 1 ? 's' : ''} today!`));
      }
      
      if (stats.upcomingCount > 0) {
        console.log(chalk.yellow(`⏰ You have ${stats.upcomingCount} problem${stats.upcomingCount > 1 ? 's' : ''} ready for review.`));
      }
      
      if (stats.averageTimeImprovement > 10) {
        console.log(chalk.green('🚀 Your solving speed is improving significantly!'));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });