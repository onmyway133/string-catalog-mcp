import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { StringCatalog } from '../../string-catalog';

export function registerListSupportedLanguages(server: McpServer) {
    server.registerTool(
        'list_supported_languages',
        {
            description:
                'List all supported languages in a given Xcode String Catalog (.xcstrings) file. Returns the source language and all languages that have translations.',
            inputSchema: {
                filePath: z.string().describe('Absolute path to the .xcstrings file'),
            },
        },
        async ({ filePath }) => {
            const catalog = new StringCatalog(filePath);
            const languages = catalog.getSupportedLanguages();
            const sourceLanguage = catalog.getSourceLanguage();

            return {
                content: [
                    {
                        type: 'text' as const,
                        text: JSON.stringify(
                            {
                                sourceLanguage,
                                supportedLanguages: languages,
                                count: languages.length,
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
