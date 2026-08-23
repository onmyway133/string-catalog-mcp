import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { StringCatalog } from '../../string-catalog';

const toolDescription = `Update or add translations to a String Catalog. Accepts an array of translation entries.

IMPORTANT: iOS strings support format placeholders that must be preserved in translations:
- %@ for strings (objects)
- %d or %lld for integers
- %f for floating point numbers
- %1$@, %2$@ etc. for positional arguments (order can be changed in translations)

Use \`value\` for simple strings. Use \`pluralForms\` for count-dependent strings (e.g. "%d day").
The required plural forms depend on the language:
- 1-form (ja, ko, zh-Hans, zh-Hant, th): only "other"
- 2-form (en, de, fr, es, it, nl, pt-PT): "one" + "other"
- 3-form (ru): "one" + "few" + "many"
- 4-form (pl): "one" + "few" + "many" + "other"
- 6-form (ar): "zero" + "one" + "two" + "few" + "many" + "other"

Example input:
{
  "data": [
    {
      "key": "hello_world",
      "translations": [
        { "language": "en", "value": "Hello World" },
        { "language": "de", "value": "Hallo Welt" }
      ],
      "comment": "Greeting shown on home screen"
    },
    {
      "key": "%d day",
      "translations": [
        { "language": "en", "pluralForms": { "one": "%d day", "other": "%d days" } },
        { "language": "de", "pluralForms": { "one": "%d Tag", "other": "%d Tage" } },
        { "language": "ja", "pluralForms": { "other": "%d 日" } },
        { "language": "ar", "pluralForms": { "zero": "%d أيام", "one": "%d يوم", "two": "%d يومان", "few": "%d أيام", "many": "%d يومًا", "other": "%d يوم" } },
        { "language": "ru", "pluralForms": { "one": "%d день", "few": "%d дня", "many": "%d дней" } },
        { "language": "pl", "pluralForms": { "one": "%d dzień", "few": "%d dni", "many": "%d dni", "other": "%d dnia" } }
      ]
    }
  ]
}`;

const pluralFormsSchema = z
    .object({
        zero: z.string().optional(),
        one: z.string().optional(),
        two: z.string().optional(),
        few: z.string().optional(),
        many: z.string().optional(),
        other: z.string().optional(),
    })
    .optional()
    .describe('Plural forms per CLDR rules. Use instead of value for count-dependent strings.');

const translationSchema = z.object({
    language: z.string().describe('Language code (e.g., "en", "de", "ja", "ar")'),
    value: z
        .string()
        .optional()
        .describe('Simple translated text. Mutually exclusive with pluralForms.'),
    pluralForms: pluralFormsSchema,
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
                        text: JSON.stringify({
                                success: true,
                                updatedKeys: result.updated,
                                createdKeys: result.created,
                                totalUpdated: result.updated.length,
                                totalCreated: result.created.length,
                            }),
                    },
                ],
            };
        }
    );
}
