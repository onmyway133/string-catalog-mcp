import { Command } from 'commander';
import { StringCatalog } from '../../index.js';
import { printTable, printJson } from '../output.js';

export function createStaleCommand(): Command {
    return new Command('stale')
        .description('List keys that are stale (extractionState or stringUnit state is stale)')
        .argument('<file>', 'Path to .xcstrings file')
        .option('--json', 'Output as JSON')
        .action((file: string, options: { json?: boolean }) => {
            const catalog = new StringCatalog(file);
            const staleKeys = catalog.getStaleKeys();

            if (options.json) {
                printJson(staleKeys);
                return;
            }

            if (staleKeys.length === 0) {
                console.log('No stale keys found.');
                return;
            }

            const rows = staleKeys.map((s) => [s.key, s.reason, s.language ?? '']);
            printTable(['Key', 'Reason', 'Language'], rows);
            console.log(`\n${staleKeys.length} stale key(s) found.`);
        });
}
