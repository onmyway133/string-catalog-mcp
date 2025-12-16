import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { StringCatalog } from '../string-catalog';

const toolDescription = `Update or add translations to a String Catalog. Accepts an array of translation entries.

IMPORTANT: iOS strings support format placeholders that must be preserved in translations:
- %@ for strings (objects)
- %d or %lld for integers
- %f for floating point numbers
- %1$@, %2$@ etc. for positional arguments (order can be changed in translations)

Example input:
{
  "data": [
    {
      "key": "hello_world",
      "translations": [
        { "language": "en", "value": "Hello World" },
        { "language": "de", "value": "Hallo Welt" },
        { "language": "no", "value": "Hei Verden" }
      ],
      "comment": "Greeting message shown on home screen"
    },
    {
      "key": "items_count",
      "translations": [
        { "language": "en", "value": "%lld items" },
        { "language": "de", "value": "%lld Elemente" }
      ]
    }
  ]
}`;

const translationSchema = z.object({
    language: z.string().describe('Language code (e.g., "en", "de", "no", "vi")'),
    value: z
        .string()
        .describe('The translated text. Preserve any format placeholders like %@, %lld, %d'),
    state: z
        .enum(['new', 'translated', 'needs_review', 'stale'])
        .optional()
        .describe('Translation state (defaults to "translated")'),
});

const translationsSchema = z.object({
    key: z.string().describe('The localization key'),
    translations: z.array(translationSchema).describe('Array of language translations'),
    comment: z.string().optional().describe('Optional comment describing the string context'),
});

const inputSchema = z.object({
    filePath: z.string().describe('Absolute path to the .xcstrings file'),
    data: z.array(translationsSchema).describe('Array of translation entries to add or update'),
});

export function registerUpdateTranslations(server: McpServer) {
    server.registerTool(
        'update_translations',
        {
            description: toolDescription,
            inputSchema,
        },
        async ({ filePath, data }) => {
            const catalog = new StringCatalog(filePath);
            const result = catalog.updateTranslations(data);
            catalog.save();

            return {
                content: [
                    {
                        type: 'text' as const,
                        text: JSON.stringify(
                            {
                                success: true,
                                updatedKeys: result.updated,
                                createdKeys: result.created,
                                totalUpdated: result.updated.length,
                                totalCreated: result.created.length,
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
