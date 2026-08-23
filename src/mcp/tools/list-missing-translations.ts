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
                    .describe('Filter to a specific language code (e.g. "de"). If omitted, checks all supported languages.'),
                limit: z
                    .number()
                    .optional()
                    .default(50)
                    .describe('Maximum number of results to return (default: 50)'),
                offset: z
                    .number()
                    .optional()
                    .default(0)
                    .describe('Number of results to skip (for pagination, default: 0)'),
            },
        },
        async ({ filePath, language, limit: limitArg, offset: offsetArg }) => {
            const limit = limitArg ?? 50;
            const offset = offsetArg ?? 0;
            const catalog = new StringCatalog(filePath);
            const all = catalog.getMissingTranslations(language);
            const paginated = all.slice(offset, offset + limit);

            return {
                content: [
                    {
                        type: 'text' as const,
                        text: JSON.stringify({
                            missingTranslations: paginated,
                            total: all.length,
                            offset,
                            limit,
                            hasMore: offset + limit < all.length,
                        }),
                    },
                ],
            };
        },
    );
}
