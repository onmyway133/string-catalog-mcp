import { Command } from 'commander';
import { StringCatalog } from '../../index.js';
import { printTable, printJson } from '../output.js';

export function createKeysCommand(): Command {
    return new Command('keys')
        .description('List all string keys in the catalog')
        .argument('<file>', 'Path to .xcstrings file')
        .option('--limit <n>', 'Maximum number of keys to return', '100')
        .option('--offset <n>', 'Number of keys to skip', '0')
        .option('--json', 'Output as JSON')
        .action((file: string, options: { limit: string; offset: string; json?: boolean }) => {
            const catalog = new StringCatalog(file);
            const allKeys = catalog.getAllKeys();
            const limit = parseInt(options.limit, 10);
            const offset = parseInt(options.offset, 10);
            const keys = allKeys.slice(offset, offset + limit);
            const hasMore = offset + limit < allKeys.length;

            if (options.json) {
                printJson({ keys, total: allKeys.length, offset, limit, hasMore });
                return;
            }

            const rows = keys.map((key, i) => [String(offset + i + 1), key]);
            printTable(['#', 'Key'], rows);
            if (hasMore) {
                console.log(`\n(${allKeys.length - offset - limit} more keys, use --offset to paginate)`);
            }
        });
}
