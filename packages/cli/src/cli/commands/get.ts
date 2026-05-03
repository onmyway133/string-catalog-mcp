import { Command } from 'commander';
import chalk from 'chalk';
import { StringCatalog } from '../../index.js';
import { printJson, printError } from '../output.js';
import { LocalizationState } from '../../types.js';

function colorState(state: LocalizationState): string {
    switch (state) {
        case 'translated':
            return chalk.green(state);
        case 'needs_review':
            return chalk.yellow(state);
        case 'new':
            return chalk.blue(state);
        case 'stale':
            return chalk.red(state);
    }
}

export function createGetCommand(): Command {
    return new Command('get')
        .description('Get all translations for a specific key')
        .argument('<file>', 'Path to .xcstrings file')
        .argument('<key>', 'The string key to look up')
        .option('--json', 'Output as JSON')
        .action((file: string, key: string, options: { json?: boolean }) => {
            const catalog = new StringCatalog(file);
            const result = catalog.getTranslationsForKey(key);

            if (!result) {
                printError(`Key not found: "${key}"`);
                process.exit(1);
            }

            if (options.json) {
                printJson(result);
                return;
            }

            console.log(`Key: ${chalk.bold(result.key)}\n`);

            const headers = ['Language', 'Value', 'State'];
            const rows = result.translations.map((t) => [t.language, t.value, t.state]);

            // Compute column widths from raw (uncolored) values
            const colWidths = headers.map((h, i) =>
                Math.max(h.length, ...rows.map((r) => (r[i] ?? '').length)),
            );
            const separator = colWidths.map((w) => '─'.repeat(w)).join('  ');

            console.log(chalk.bold(headers.map((h, i) => h.padEnd(colWidths[i])).join('  ')));
            console.log(separator);

            for (const row of result.translations) {
                const lang = row.language.padEnd(colWidths[0]);
                const val = row.value.padEnd(colWidths[1]);
                const state = colorState(row.state);
                console.log(`${lang}  ${val}  ${state}`);
            }
        });
}
