import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerReviewTranslationsPrompt(server: McpServer) {
    server.registerPrompt(
        'review-translations',
        {
            description: 'Review existing translations for quality, consistency, and proper placeholder usage.',
            argsSchema: {
                filePath: z.string().describe('Absolute path to the .xcstrings file'),
                languages: z.string().optional().describe('Comma-separated list of language codes to review (default: all)'),
                focusAreas: z.string().optional().describe('Comma-separated areas to focus on (e.g., "placeholders,consistency,tone")'),
            },
        },
        async ({ filePath, languages, focusAreas }) => {
            const langSection = languages
                ? `\n## Languages to Review\n${languages.split(',').map(l => `- ${l.trim()}`).join('\n')}\n`
                : '\n## Languages to Review\nAll available languages in the catalog.\n';

            const focusSection = focusAreas
                ? `\n## Focus Areas\n${focusAreas.split(',').map(f => `- ${f.trim()}`).join('\n')}\n`
                : '';

            return {
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Review translations in ${filePath}.
${langSection}${focusSection}
Check for:
- Missing/mismatched iOS placeholders (%@, %d/%lld, %f, %1$@ positional)
- Accuracy and natural phrasing for mobile UI
- Consistency of terminology across keys
- Translations significantly longer than source (space constraints)

Use \`get_catalog_statistics\` for coverage overview, \`list_all_keys\` to browse, \`get_translations_for_key\` to inspect specific entries.
Report issues by severity (critical/warning/suggestion) with the key, language, and suggested fix in update_translations JSON format.`,
                        },
                    },
                ],
            };
        }
    );
}
