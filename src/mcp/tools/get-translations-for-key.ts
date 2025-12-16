import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { StringCatalog } from '../../string-catalog';

export function registerGetTranslationsForKey(server: McpServer) {
    server.registerTool(
        'get_translations_for_key',
        {
            description:
                'Get all translations for a specific key in a String Catalog. Shows the translated text in each supported language along with the translation state.',
            inputSchema: {
                filePath: z.string().describe('Absolute path to the .xcstrings file'),
                key: z.string().describe('The localization key to look up'),
            },
        },
        async ({ filePath, key }) => {
            const catalog = new StringCatalog(filePath);
            const result = catalog.getTranslationsForKey(key);

            if (!result) {
                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify(
                                { error: `Key "${key}" not found in catalog` },
                                null,
                                2
                            ),
                        },
                    ],
                };
            }

            return {
                content: [
                    {
                        type: 'text' as const,
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
    );
}
