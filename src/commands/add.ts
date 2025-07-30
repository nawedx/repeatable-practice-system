import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { SpacedRepetitionService } from '../services/SpacedRepetitionService';
import { connectDatabase } from '../utils/database';

export const addCommand = new Command('add')
  .description('Add a new problem to your practice list')
  .argument('[title]', 'Problem title')
  .argument('[difficulty]', 'Problem difficulty: easy | medium | hard')
  .argument('[topics...]', 'Problem topics (space-separated)')
  .option('-t, --time <minutes>', 'Estimated time in minutes')
  .option('-u, --url <url>', 'LeetCode URL')
  .action(async (title?: string, difficulty?: string, topics?: string[], options?: any) => {
    try {
      await connectDatabase();
      
      const questions = [];
      
      if (!title) {
        questions.push({
          type: 'input',
          name: 'title',
          message: 'Problem title:',
          validate: (input: string) => input.trim().length > 0 || 'Title is required'
        });
      }
      
      if (!difficulty) {
        questions.push({
          type: 'list',
          name: 'difficulty',
          message: 'Problem difficulty:',
          choices: ['easy', 'medium', 'hard']
        });
      }
      
      if (!topics || topics.length === 0) {
        questions.push({
          type: 'input',
          name: 'topics',
          message: 'Topics (comma-separated):',
          validate: (input: string) => input.trim().length > 0 || 'At least one topic is required'
        });
      }
      
      if (!options?.time) {
        questions.push({
          type: 'input',
          name: 'estimatedTime',
          message: 'Estimated time (minutes):',
          validate: (input: string) => {
            const num = parseInt(input);
            return (!isNaN(num) && num > 0) || 'Please enter a valid positive number';
          }
        });
      }
      
      if (!options?.url) {
        questions.push({
          type: 'input',
          name: 'leetcodeUrl',
          message: 'LeetCode URL (optional):',
          validate: (input: string) => {
            if (!input.trim()) return true;
            return input.startsWith('https://leetcode.com/problems/') || 'Please enter a valid LeetCode URL';
          }
        });
      }
      
      const answers = await inquirer.prompt(questions);
      
      const finalTitle = title || answers.title;
      const finalDifficulty = difficulty || answers.difficulty;
      const finalTopics = topics && topics.length > 0 ? 
        topics : 
        answers.topics.split(',').map((t: string) => t.trim()).filter((t: string) => t);
      const finalTime = options?.time ? parseInt(options.time) : parseInt(answers.estimatedTime);
      const finalUrl = options?.url || answers.leetcodeUrl || undefined;
      
      if (!['easy', 'medium', 'hard'].includes(finalDifficulty)) {
        console.error(chalk.red('❌ Invalid difficulty. Use: easy | medium | hard'));
        process.exit(1);
      }
      
      const problem = await SpacedRepetitionService.addProblem(
        finalTitle,
        finalDifficulty as 'easy' | 'medium' | 'hard',
        finalTopics,
        finalTime,
        finalUrl
      );
      
      console.log(chalk.green('✅ Problem added successfully!'));
      console.log();
      console.log(chalk.blue('📝 Problem Details:'));
      console.log(`   Title: ${chalk.white(problem.title)}`);
      console.log(`   Difficulty: ${chalk.yellow(problem.difficulty)}`);
      console.log(`   Topics: ${chalk.cyan(problem.topics.join(', '))}`);
      console.log(`   Estimated Time: ${chalk.magenta(problem.estimatedTime + ' minutes')}`);
      if (problem.leetcodeUrl) {
        console.log(`   URL: ${chalk.blue(problem.leetcodeUrl)}`);
      }
      console.log(`   ID: ${chalk.gray((problem._id as any).toString().slice(-6))}`);
      console.log();
      console.log(chalk.gray('💡 This problem will appear in tomorrow\'s practice session.'));
      
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        console.error(chalk.red('❌ A problem with this title already exists.'));
      } else {
        console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : 'Unknown error');
      }
      process.exit(1);
    }
  });