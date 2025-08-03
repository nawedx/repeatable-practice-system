import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { format } from 'date-fns';
import { SpacedRepetitionService } from '../services/SpacedRepetitionService';
import { connectDatabase, disconnectDatabase } from '../utils/database';

export const todayCommand = new Command('today')
  .description('Show today\'s problems to solve')
  .action(async () => {
    try {
      await connectDatabase();
      
      const problems = await SpacedRepetitionService.getTodaysProblems();
      
      if (problems.length === 0) {
        console.log(chalk.green('🎉 No problems scheduled for today! Great job staying on track.'));
        await disconnectDatabase();
        return;
      }
      
      console.log(chalk.blue.bold(`📚 Problems for ${format(new Date(), 'MMMM dd, yyyy')}`));
      console.log();
      
      const table = new Table({
        head: [
          chalk.cyan('Title'),
          chalk.cyan('Difficulty'),
          chalk.cyan('Topics'),
          chalk.cyan('Est. Time'),
          chalk.cyan('Repetition')
        ],
        colWidths: [35, 12, 30, 12, 12]
      });
      
      problems.forEach(problem => {
        const difficultyColor = 
          problem.difficulty === 'easy' ? chalk.green :
          problem.difficulty === 'medium' ? chalk.yellow :
          chalk.red;
        
        table.push([
          problem.title.slice(0, 33),
          difficultyColor(problem.difficulty),
          problem.topics.join(', ').slice(0, 28),
          `${problem.estimatedTime}m`,
          `#${problem.schedule.repetitions + 1}`
        ]);
      });
      
      console.log(table.toString());
      console.log();
      console.log(chalk.gray('💡 Use'), chalk.white('dsa complete "<title>" <time> <difficulty>'), chalk.gray('to mark a problem as done'));
      console.log(chalk.gray('   Example:'), chalk.white('dsa complete "Two Sum" 15 good'));
      console.log(chalk.gray('   Difficulty: easy | good | hard | failed'));
      
      await disconnectDatabase();
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : 'Unknown error');
      await disconnectDatabase();
      process.exit(1);
    }
  });