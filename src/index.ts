#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { todayCommand } from './commands/today';
import { completeCommand } from './commands/complete';
import { addCommand } from './commands/add';
import { statsCommand } from './commands/stats';
import { upcomingCommand } from './commands/upcoming';
import { disconnectDatabase } from './utils/database';

const program = new Command();

program
  .name('dsa')
  .description('DSA Spaced Repetition System - Accelerate your interview preparation')
  .version('1.0.0');

program.addCommand(todayCommand);
program.addCommand(completeCommand);
program.addCommand(addCommand);
program.addCommand(statsCommand);
program.addCommand(upcomingCommand);

program
  .command('help')
  .description('Show help information')
  .action(() => {
    console.log(chalk.blue.bold('🚀 DSA Spaced Repetition System'));
    console.log();
    console.log(chalk.yellow('Available Commands:'));
    console.log();
    console.log(chalk.white('  dsa today'), chalk.gray('                        - Show today\'s problems'));
    console.log(chalk.white('  dsa complete "<title>" <time> <rating>'), chalk.gray(' - Mark problem as completed'));
    console.log(chalk.white('  dsa add [title] [difficulty] [topics]'), chalk.gray('  - Add new problem'));
    console.log(chalk.white('  dsa stats'), chalk.gray('                        - Show progress statistics'));
    console.log(chalk.white('  dsa upcoming [-d days]'), chalk.gray('          - Show upcoming reviews'));
    console.log();
    console.log(chalk.yellow('Rating Options:'));
    console.log(chalk.green('  easy'), chalk.gray('  - Solved faster than expected'));
    console.log(chalk.blue('  good'), chalk.gray('  - Solved within expected time'));
    console.log(chalk.yellow('  hard'), chalk.gray('  - Took longer but solved correctly'));
    console.log(chalk.red('  failed'), chalk.gray(' - Could not solve or took too long'));
    console.log();
    console.log(chalk.yellow('Examples:'));
    console.log(chalk.gray('  dsa complete "Two Sum" 15 good'));
    console.log(chalk.gray('  dsa complete "sum" 20 hard              # Partial title search'));
    console.log(chalk.gray('  dsa add "Reverse Linked List" medium "linked-list" --time 20'));
    console.log(chalk.gray('  dsa upcoming --days 14'));
  });

process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n👋 Goodbye! Keep practicing!'));
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

program.parse();

if (!process.argv.slice(2).length) {
  program.outputHelp();
}