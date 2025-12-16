import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerTranslateStringsPrompt(server: McpServer) {
    server.registerPrompt(
        'translate-strings',
        {
            description: 'Generate translations for iOS string catalog keys. Provides guidance on format placeholders and returns structured JSON for the update_translations tool.',
            argsSchema: {
                keys: z.string().describe('Comma-separated list of keys to translate (e.g., "hello_world,goodbye,welcome_message")'),
                sourceLanguage: z.string().default('en').describe('Source language code (default: en)'),
                targetLanguages: z.string().describe('Comma-separated list of target language codes (e.g., "de,fr,ja,zh-Hans")'),
                context: z.string().optional().describe('Optional context about where these strings are used in the app'),
            },
        },
        async ({ keys, sourceLanguage, targetLanguages, context }) => {
            const keyList = keys.split(',').map(k => k.trim()).filter(Boolean);
            const targetLangList = targetLanguages.split(',').map(l => l.trim()).filter(Boolean);

            const contextSection = context
                ? `\n## Context\nThese strings are used in: ${context}\n`
                : '';

            return {
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `# Translation Request for iOS String Catalog

## Keys to Translate
${keyList.map(k => `- "${k}"`).join('\n')}

## Source Language
${sourceLanguage}

## Target Languages
${targetLangList.map(l => `- ${l}`).join('\n')}
${contextSection}
## iOS Format Placeholders
When translating, preserve these iOS format placeholders exactly as they appear:
- \`%@\` - String placeholder (objects)
- \`%d\` or \`%lld\` - Integer placeholder
- \`%f\` - Floating point number placeholder
- \`%1$@\`, \`%2$@\` - Positional arguments (order CAN be changed to fit natural language grammar)

## Example
If source is: "Hello %@, you have %lld items"
German could be: "Hallo %@, Sie haben %lld Artikel"
Japanese could be: "%@さん、%lld個のアイテムがあります"

## Instructions
1. Translate each key into all target languages
2. Preserve all format placeholders
3. Ensure translations sound natural in each language
4. Consider cultural context and localization best practices

## Required Output Format
Return the translations as JSON that can be used with the \`update_translations\` tool:

\`\`\`json
{
    "data": [
        {
            "key": "key_name",
            "translations": [
                { "language": "en", "value": "English text" },
                { "language": "de", "value": "German text" },
                { "language": "fr", "value": "French text" }
            ],
            "comment": "Optional: describe where this string is used"
        }
    ]
}
\`\`\`

Please translate the keys now.`,
                        },
                    },
                ],
            };
        }
    );
}
