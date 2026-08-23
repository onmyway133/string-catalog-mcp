import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { StringCatalog } from '../../string-catalog';

export function registerListStaleKeys(server: McpServer) {
    server.registerTool(
        'list_stale_keys',
        {
            description:
                'List keys that are stale — either their extractionState is "stale" (Xcode removed the source string) or any stringUnit state is "stale".',
            inputSchema: {
                filePath: z.string().describe('Absolute path to the .xcstrings file'),
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
        async ({ filePath, limit: limitArg, offset: offsetArg }) => {
            const limit = limitArg ?? 50;
            const offset = offsetArg ?? 0;
            const catalog = new StringCatalog(filePath);
            const all = catalog.getStaleKeys();
            const paginated = all.slice(offset, offset + limit);

            return {
                content: [
                    {
                        type: 'text' as const,
                        text: JSON.stringify({
                            staleKeys: paginated,
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
