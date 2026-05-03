import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { StringCatalog } from '../../string-catalog';

export function registerListMissingTranslations(server: McpServer) {
    server.registerTool(
        'list_missing_translations',
        {
            description:
                'List all keys that are missing translations for one or all languages. Skips keys with shouldTranslate: false.',
            inputSchema: {
                filePath: z.string().describe('Absolute path to the .xcstrings file'),
                language: z
                    .string()
                    .optional()
                    .describe(
                        'Filter to a specific language code (e.g. "de"). If omitted, checks all supported languages.',
                    ),
            },
        },
        async ({ filePath, language }) => {
            const catalog = new StringCatalog(filePath);
            const missing = catalog.getMissingTranslations(language);

            return {
                content: [
                    {
                        type: 'text' as const,
                        text: JSON.stringify(
                            { missingTranslations: missing, total: missing.length },
                            null,
                            2,
                        ),
                    },
                ],
            };
        },
    );
}
