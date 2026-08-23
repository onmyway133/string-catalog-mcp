import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerBatchTranslatePrompt(server: McpServer) {
    server.registerPrompt(
        'batch-translate',
        {
            description: 'Translate all untranslated or stale strings in a catalog for specified languages.',
            argsSchema: {
                filePath: z.string().describe('Absolute path to the .xcstrings file'),
                targetLanguages: z.string().describe('Comma-separated list of target language codes (e.g., "de,fr,ja")'),
                includeStale: z.boolean().default(false).describe('Whether to re-translate stale entries'),
                batchSize: z.number().default(20).describe('Number of keys to translate per batch (default: 20)'),
            },
        },
        async ({ filePath, targetLanguages, includeStale, batchSize }) => {
            const targetLangList = targetLanguages.split(',').map(l => l.trim()).filter(Boolean);

            return {
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `# Batch Translation Request

## String Catalog File
${filePath}

## Target Languages
${targetLangList.map(l => `- ${l}`).join('\n')}

## Options
- Include stale translations: ${includeStale ? 'Yes' : 'No'}
- Batch size: ${batchSize} keys per batch

## Workflow

### Step 1: Get missing keys
Call \`list_missing_translations\` to get keys that need translation. Use \`limit\` and \`offset\` to page through results if \`hasMore\` is true.

### Step 2: Get source texts in bulk
Call \`get_source_texts\` with all keys from one page at once — do NOT call \`get_translations_for_key\` in a loop.

### Step 3: Translate and save
Translate all keys from the batch, then call \`update_translations\` once with the full payload.

Repeat steps 1–3 with the next page until \`hasMore\` is false.

## iOS Format Placeholders
Preserve: \`%@\` (string), \`%d\`/\`%lld\` (int), \`%f\` (float), \`%1$@\`/\`%2$@\` (positional — order can change).

## Output Format per batch
\`\`\`json
{"data":[{"key":"key_name","translations":[{"language":"de","value":"..."}]}]}
\`\`\`

Begin now.`,
                        },
                    },
                ],
            };
        }
    );
}
