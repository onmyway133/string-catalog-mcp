import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { StringCatalog } from '../../string-catalog';

const toolDescription = `Update or add translations to a String Catalog.

Preserve iOS format placeholders: %@ (string), %d/%lld (int), %f (float), %1$@ (positional).
Use \`value\` for simple strings, \`pluralForms\` for count-dependent strings.
Plural form counts by language: ja/ko/zh/th=1(other), en/de/fr=2(one+other), ru=3(one+few+many), pl=4(one+few+many+other), ar=6(zero+one+two+few+many+other).`;

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
