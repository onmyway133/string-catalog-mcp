import { Command } from 'commander';
import chalk from 'chalk';
import { StringCatalog } from '../../index.js';
import { printTable, printJson } from '../output.js';

export function createStatsCommand(): Command {
    return new Command('stats')
        .description('Show detailed translation statistics for the catalog')
        .argument('<file>', 'Path to .xcstrings file')
        .option('--json', 'Output as JSON')
        .action((file: string, options: { json?: boolean }) => {
            const catalog = new StringCatalog(file);
            const stats = catalog.getDetailedStatistics();

            if (options.json) {
                printJson(stats);
                return;
            }

            console.log(chalk.bold(`File: ${file}`));
            console.log(`Total keys:       ${stats.totalKeys}`);
            console.log(`Translatable:     ${stats.translatableKeys}`);
            if (stats.skippedKeys > 0) {
                console.log(`Skipped:          ${stats.skippedKeys} (shouldTranslate: false)`);
            }
            console.log('');

            const rows = Object.entries(stats.translationCoverage).map(([lang, cov]) => [
                lang,
                String(cov.translated),
                String(cov.needs_review),
                String(cov.new),
                String(cov.stale),
                String(cov.total),
                `${cov.percentage}%`,
            ]);
            printTable(
                ['Language', 'Translated', 'Needs Review', 'New', 'Stale', 'Total', 'Coverage'],
                rows,
            );
        });
}
