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
            },
        },
        async ({ filePath }) => {
            const catalog = new StringCatalog(filePath);
            const staleKeys = catalog.getStaleKeys();

            return {
                content: [
                    {
                        type: 'text' as const,
                        text: JSON.stringify(
                            { staleKeys, total: staleKeys.length },
                            null,
                            2,
                        ),
                    },
                ],
            };
        },
    );
}
