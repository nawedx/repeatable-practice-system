import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { SpacedRepetitionService, DifficultyRating } from '../services/SpacedRepetitionService';
import { connectDatabase, disconnectDatabase } from '../utils/database';

export const completeCommand = new Command('complete')
  .description('Mark a problem as completed')
  .argument('<problemQuery>', 'Problem title or partial title (will search)')
  .argument('<timeSpent>', 'Time spent in minutes')
  .argument('<difficulty>', 'Difficulty rating: easy | good | hard | failed')
  .option('-n, --notes <notes>', 'Optional notes about the attempt')
  .action(async (problemQuery: string, timeSpent: string, difficulty: string, options) => {
    try {
      await connectDatabase();
      
      const timeSpentNum = parseInt(timeSpent);
      if (isNaN(timeSpentNum) || timeSpentNum < 0) {
        console.error(chalk.red('❌ Invalid time spent. Please provide a positive number.'));
        process.exit(1);
      }
      
      const validDifficulties: DifficultyRating[] = ['easy', 'good', 'hard', 'failed'];
      if (!validDifficulties.includes(difficulty as DifficultyRating)) {
        console.error(chalk.red('❌ Invalid difficulty. Use: easy | good | hard | failed'));
        process.exit(1);
      }
      
      const { Problem } = await import('../models');
      
      // Search for problems by title (case-insensitive, partial match)
      const matchingProblems = await Problem.find({
        title: { $regex: problemQuery, $options: 'i' }
      });
      
      if (matchingProblems.length === 0) {
        console.error(chalk.red('❌ No problems found matching:'), chalk.white(problemQuery));
        console.log(chalk.gray('💡 Try a different search term or use'), chalk.white('dsa today'), chalk.gray('to see available problems'));
        process.exit(1);
      }
      
      let selectedProblem;
      if (matchingProblems.length === 1) {
        selectedProblem = matchingProblems[0];
      } else {
        const choices = matchingProblems.map(p => ({
          name: `${p.title} [${p.difficulty}] - ${p.topics.join(', ')}`,
          value: p
        }));
        
        const answer = await inquirer.prompt([{
          type: 'list',
          name: 'problem',
          message: `Found ${matchingProblems.length} problems. Please select:`,
          choices
        }]);
        
        selectedProblem = answer.problem;
      }
      
      const fullProblemId = (selectedProblem._id as any).toString();
      
      console.log(chalk.blue('📝 Selected:'), chalk.white(selectedProblem.title));
      
      let notes = options.notes;
      if (!notes && difficulty === 'failed') {
        const answer = await inquirer.prompt([{
          type: 'input',
          name: 'notes',
          message: 'Any notes about what went wrong? (optional):'
        }]);
        notes = answer.notes;
      }
      
      await SpacedRepetitionService.recordAttempt(
        fullProblemId,
        timeSpentNum,
        difficulty as DifficultyRating,
        notes
      );
      
      const emoji = difficulty === 'failed' ? '😞' : difficulty === 'hard' ? '😅' : difficulty === 'good' ? '😊' : '🚀';
      const message = difficulty === 'failed' ? 
        'Don\'t worry, you\'ll get it next time!' :
        'Great job! Keep up the good work!';
      
      console.log(chalk.green(`${emoji} Problem completed successfully!`));
      console.log(chalk.gray(message));
      
      if (difficulty !== 'failed') {
        console.log(chalk.blue('📅 Next review has been scheduled based on your performance.'));
      } else {
        console.log(chalk.yellow('🔄 This problem will appear again tomorrow.'));
      }
      
      await disconnectDatabase();
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : 'Unknown error');
      await disconnectDatabase();
      process.exit(1);
    }
  });