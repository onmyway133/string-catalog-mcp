import { Command } from 'commander';
import { StringCatalog } from '../../index.js';
import { printTable, printJson } from '../output.js';

export function createLanguagesCommand(): Command {
    return new Command('languages')
        .description('List all languages with translation coverage percentages')
        .argument('<file>', 'Path to .xcstrings file')
        .option('--json', 'Output as JSON')
        .action((file: string, options: { json?: boolean }) => {
            const catalog = new StringCatalog(file);
            const stats = catalog.getStatistics();

            if (options.json) {
                printJson({
                    sourceLanguage: stats.languages[0],
                    languages: stats.translationCoverage,
                });
                return;
            }

            const rows = Object.entries(stats.translationCoverage).map(([lang, cov]) => [
                lang,
                String(cov.translated),
                String(cov.total),
                `${cov.percentage}%`,
            ]);
            printTable(['Language', 'Translated', 'Total', 'Coverage'], rows);
        });
}
