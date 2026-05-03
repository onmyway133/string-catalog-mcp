#!/usr/bin/env node
import { Command } from 'commander';
import { createLanguagesCommand } from './commands/languages.js';
import { createStatsCommand } from './commands/stats.js';

const program = new Command();
program
    .name('scat')
    .description('String Catalog CLI — manage Xcode .xcstrings files')
    .version('1.0.0');

program.addCommand(createLanguagesCommand());
program.addCommand(createStatsCommand());

program.parse();
