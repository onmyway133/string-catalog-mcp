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
                            text: `Translate these iOS string catalog keys from ${sourceLanguage} into: ${targetLangList.join(', ')}.
${contextSection}
Keys:
${keyList.map(k => `- "${k}"`).join('\n')}

Preserve iOS placeholders exactly: %@ (string), %d/%lld (int), %f (float), %1$@ (positional — order can change per language grammar).

Return JSON for the update_translations tool:
{"data":[{"key":"key_name","translations":[{"language":"en","value":"..."},{"language":"de","value":"..."}]}]}`,
                        },
                    },
                ],
            };
        }
    );
}
