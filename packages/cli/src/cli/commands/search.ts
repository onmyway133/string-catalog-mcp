import { Command } from 'commander';
import { StringCatalog } from '../../index.js';
import { printTable, printJson } from '../output.js';

export function createSearchCommand(): Command {
    return new Command('search')
        .description('Search for keys containing a substring (case-insensitive)')
        .argument('<file>', 'Path to .xcstrings file')
        .argument('<query>', 'Search query')
        .option('--json', 'Output as JSON')
        .action((file: string, query: string, options: { json?: boolean }) => {
            const catalog = new StringCatalog(file);
            const matchingKeys = catalog.searchKeys(query);

            if (options.json) {
                printJson({ query, matchingKeys, count: matchingKeys.length });
                return;
            }

            if (matchingKeys.length === 0) {
                console.log(`No keys found matching "${query}".`);
                return;
            }

            const rows = matchingKeys.map((key, i) => [String(i + 1), key]);
            printTable(['#', 'Key'], rows);
            console.log(`\n${matchingKeys.length} key(s) found.`);
        });
}
