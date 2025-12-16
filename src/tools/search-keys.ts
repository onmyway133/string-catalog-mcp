import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { StringCatalog } from '../string-catalog';

export function registerSearchKeys(server: McpServer) {
    server.registerTool(
        'search_keys',
        {
            description:
                'Search for localization keys containing a specific substring. Useful for finding keys when you only know part of the key name.',
            inputSchema: {
                filePath: z.string().describe('Absolute path to the .xcstrings file'),
                query: z
                    .string()
                    .describe('Substring to search for in key names (case-insensitive)'),
            },
        },
        async ({ filePath, query }) => {
            const catalog = new StringCatalog(filePath);
            const keys = catalog.searchKeys(query);

            return {
                content: [
                    {
                        type: 'text' as const,
                        text: JSON.stringify(
                            {
                                query,
                                matchingKeys: keys,
                                count: keys.length,
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
