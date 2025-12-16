import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { StringCatalog } from '../string-catalog';

export function registerListAllKeys(server: McpServer) {
    server.registerTool(
        'list_all_keys',
        {
            description:
                'List all localization keys in a String Catalog. Returns keys sorted alphabetically.',
            inputSchema: {
                filePath: z.string().describe('Absolute path to the .xcstrings file'),
                limit: z
                    .number()
                    .optional()
                    .default(100)
                    .describe('Maximum number of keys to return (default: 100)'),
                offset: z
                    .number()
                    .optional()
                    .default(0)
                    .describe('Number of keys to skip (for pagination, default: 0)'),
            },
        },
        async ({ filePath, limit: limitArg, offset: offsetArg }) => {
            const limit = limitArg ?? 100;
            const offset = offsetArg ?? 0;
            const catalog = new StringCatalog(filePath);
            const allKeys = catalog.getAllKeys();
            const paginatedKeys = allKeys.slice(offset, offset + limit);

            return {
                content: [
                    {
                        type: 'text' as const,
                        text: JSON.stringify(
                            {
                                keys: paginatedKeys,
                                total: allKeys.length,
                                offset,
                                limit,
                                hasMore: offset + limit < allKeys.length,
                            },
                            null,
                            2
                        ),
                    },
                ],
            };
        }
    );
}
