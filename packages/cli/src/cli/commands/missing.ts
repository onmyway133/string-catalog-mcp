import { Command } from 'commander';
import { StringCatalog } from '../../index.js';
import { printTable, printJson } from '../output.js';

export function createMissingCommand(): Command {
    return new Command('missing')
        .description('List keys that are missing translations')
        .argument('<file>', 'Path to .xcstrings file')
        .option('--language <lang>', 'Check only a specific language code (e.g. "de")')
        .option('--json', 'Output as JSON')
        .action((file: string, options: { language?: string; json?: boolean }) => {
            const catalog = new StringCatalog(file);
            const missing = catalog.getMissingTranslations(options.language);

            if (options.json) {
                printJson(missing);
                return;
            }

            if (missing.length === 0) {
                console.log('All keys are fully translated.');
                return;
            }

            const rows = missing.map((m) => [m.key, m.missingLanguages.join(', ')]);
            printTable(['Key', 'Missing Languages'], rows);
            console.log(`\n${missing.length} key(s) with missing translations.`);
        });
}
