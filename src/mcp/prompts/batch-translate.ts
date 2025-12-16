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

### Step 1: Analyze the Catalog
Use \`get_catalog_statistics\` to understand the current translation coverage.

### Step 2: Identify Keys Needing Translation
Use \`search_keys\` or \`list_all_keys\` to find:
- Keys with missing translations for target languages
${includeStale ? '- Keys with stale translations that need updating' : ''}

### Step 3: Translate in Batches
For each batch of up to ${batchSize} keys:
1. Get the source text using \`get_translations_for_key\`
2. Translate to all target languages
3. Prepare the JSON payload for \`update_translations\`

## iOS Format Placeholders Reference
Preserve these placeholders in translations:
- \`%@\` - String (object)
- \`%d\` / \`%lld\` - Integer
- \`%f\` - Float
- \`%1$@\`, \`%2$@\` - Positional (can reorder for grammar)

## Output Format
For each batch, provide:

\`\`\`json
{
    "data": [
        {
            "key": "key_name",
            "translations": [
                { "language": "de", "value": "German translation" },
                { "language": "fr", "value": "French translation" }
            ]
        }
    ]
}
\`\`\`

## Instructions
1. Start by analyzing the catalog
2. Identify which keys need translation
3. Process keys in batches
4. After each batch, use \`update_translations\` to save
5. Report progress after each batch

Begin the batch translation process now.`,
                        },
                    },
                ],
            };
        }
    );
}
