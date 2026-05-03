import { Command } from 'commander';
import * as fs from 'fs';
import { StringCatalog } from '../../index.js';
import { TranslationData } from '../../types.js';
import { printError } from '../output.js';

export function createUpdateCommand(): Command {
    return new Command('update')
        .description('Update translations in the catalog from a JSON string or file')
        .argument('<file>', 'Path to .xcstrings file')
        .argument('<json-or-path>', 'Inline JSON string or path to a JSON file')
        .action((file: string, jsonOrPath: string) => {
            let raw: string;

            if (jsonOrPath.trimStart().startsWith('{') || jsonOrPath.trimStart().startsWith('[')) {
                raw = jsonOrPath;
            } else {
                if (!fs.existsSync(jsonOrPath)) {
                    printError(`File not found: "${jsonOrPath}"`);
                    process.exit(1);
                }
                raw = fs.readFileSync(jsonOrPath, 'utf-8');
            }

            let data: TranslationData;
            try {
                data = JSON.parse(raw) as TranslationData;
            } catch {
                printError('Invalid JSON. Expected format: { "data": [{ "key": "...", "translations": [...] }] }');
                process.exit(1);
            }

            if (!Array.isArray(data.data)) {
                printError('Invalid format. Expected a top-level "data" array.');
                process.exit(1);
            }

            const catalog = new StringCatalog(file);
            const result = catalog.updateTranslations(data.data);
            catalog.save();

            console.log(
                `Updated ${result.updated.length} key(s), created ${result.created.length} key(s).`,
            );
        });
}
