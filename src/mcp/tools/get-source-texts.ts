import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { StringCatalog } from '../../string-catalog.js';

export function registerGetSourceTexts(server: McpServer) {
    server.registerTool(
        'get_source_texts',
        {
            description:
                'Get source-language text for multiple keys in one call. Use this instead of calling get_translations_for_key in a loop — much cheaper on context.',
            inputSchema: {
                filePath: z.string().describe('Absolute path to the .xcstrings file'),
                keys: z.array(z.string()).describe('List of localization keys to look up'),
            },
        },
        async ({ filePath, keys }) => {
            const catalog = new StringCatalog(filePath);
            const sourceLanguage = catalog.getSourceLanguage();
            const sourceTexts: Record<string, string | null> = {};

            for (const key of keys) {
                const result = catalog.getTranslationsForKey(key);
                const source = result?.translations.find((t) => t.language === sourceLanguage);
                sourceTexts[key] = source?.value ?? null;
            }

            return {
                content: [
                    {
                        type: 'text' as const,
                        text: JSON.stringify({ sourceLanguage, sourceTexts }),
                    },
                ],
            };
        }
    );
}
