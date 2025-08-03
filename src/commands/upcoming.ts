import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { format, formatDistanceToNow } from 'date-fns';
import { SpacedRepetitionService } from '../services/SpacedRepetitionService';
import { connectDatabase, disconnectDatabase } from '../utils/database';

export const upcomingCommand = new Command('upcoming')
  .description('Show upcoming problem reviews')
  .option('-d, --days <days>', 'Number of days to look ahead (default: 7)', '7')
  .action(async (options) => {
    try {
      await connectDatabase();
      
      const days = parseInt(options.days);
      if (isNaN(days) || days < 1) {
        console.error(chalk.red('❌ Invalid number of days. Please provide a positive number.'));
        process.exit(1);
      }
      
      const problems = await SpacedRepetitionService.getUpcomingProblems(days);
      
      if (problems.length === 0) {
        console.log(chalk.green(`🎉 No problems scheduled for the next ${days} days!`));
        console.log(chalk.gray('   Great job staying ahead of your reviews.'));
        await disconnectDatabase();
        return;
      }
      
      console.log(chalk.blue.bold(`📅 Upcoming Reviews (Next ${days} days)`));
      console.log();
      
      const table = new Table({
        head: [
          chalk.cyan('Date'),
          chalk.cyan('Title'),
          chalk.cyan('Difficulty'),
          chalk.cyan('Topics'),
          chalk.cyan('Due In')
        ],
        colWidths: [12, 30, 12, 25, 15]
      });
      
      problems.forEach(problem => {
        const difficultyColor = 
          problem.difficulty === 'easy' ? chalk.green :
          problem.difficulty === 'medium' ? chalk.yellow :
          chalk.red;
        
        const dueIn = formatDistanceToNow(new Date(problem.schedule.nextReview), { addSuffix: true });
        
        table.push([
          format(new Date(problem.schedule.nextReview), 'MMM dd'),
          problem.title.slice(0, 28),
          difficultyColor(problem.difficulty),
          problem.topics.join(', ').slice(0, 23),
          chalk.gray(dueIn.replace('in ', ''))
        ]);
      });
      
      console.log(table.toString());
      console.log();
      
      // Group by date for summary
      const byDate = problems.reduce((acc, problem) => {
        const date = format(new Date(problem.schedule.nextReview), 'yyyy-MM-dd');
        if (!acc[date]) acc[date] = 0;
        acc[date]++;
        return acc;
      }, {} as Record<string, number>);
      
      console.log(chalk.blue.bold('📊 Daily Summary:'));
      Object.entries(byDate).forEach(([date, count]) => {
        const formattedDate = format(new Date(date), 'EEEE, MMM dd');
        console.log(`   ${chalk.white(formattedDate)}: ${chalk.yellow(count)} problem${count > 1 ? 's' : ''}`);
      });
      
      console.log();
      console.log(chalk.gray('💡 Use'), chalk.white('dsa today'), chalk.gray('to see problems due today'));
      
      await disconnectDatabase();
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : 'Unknown error');
      await disconnectDatabase();
      process.exit(1);
    }
  });