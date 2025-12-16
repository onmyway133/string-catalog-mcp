import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { StringCatalog } from '../string-catalog';

export function registerGetCatalogStatistics(server: McpServer) {
    server.registerTool(
        'get_catalog_statistics',
        {
            description:
                'Get statistics about a String Catalog including total keys, supported languages, and translation coverage percentage for each language.',
            inputSchema: {
                filePath: z.string().describe('Absolute path to the .xcstrings file'),
            },
        },
        async ({ filePath }) => {
            const catalog = new StringCatalog(filePath);
            const stats = catalog.getStatistics();

            return {
                content: [
                    {
                        type: 'text' as const,
                        text: JSON.stringify(stats, null, 2),
                    },
                ],
            };
        }
    );
}
