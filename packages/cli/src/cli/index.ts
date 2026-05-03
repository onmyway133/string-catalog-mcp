#!/usr/bin/env node
import { Command } from 'commander';
import { createLanguagesCommand } from './commands/languages.js';
import { createStatsCommand } from './commands/stats.js';
import { createKeysCommand } from './commands/keys.js';
import { createSearchCommand } from './commands/search.js';
import { createGetCommand } from './commands/get.js';
import { createUpdateCommand } from './commands/update.js';
import { createMissingCommand } from './commands/missing.js';
import { createStaleCommand } from './commands/stale.js';

const program = new Command();
program
    .name('scat')
    .description('String Catalog CLI — manage Xcode .xcstrings files')
    .version('1.0.0');

program.addCommand(createLanguagesCommand());
program.addCommand(createStatsCommand());
program.addCommand(createKeysCommand());
program.addCommand(createSearchCommand());
program.addCommand(createGetCommand());
program.addCommand(createUpdateCommand());
program.addCommand(createMissingCommand());
program.addCommand(createStaleCommand());

program.parse();
