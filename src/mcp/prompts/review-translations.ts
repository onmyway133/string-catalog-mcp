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
                            text: `# Translation Review Request

## String Catalog File
${filePath}
${langSection}${focusSection}
## Review Checklist

### 1. Format Placeholder Verification
- Ensure all \`%@\`, \`%d\`, \`%lld\`, \`%f\` placeholders are preserved
- Verify positional arguments (\`%1$@\`, \`%2$@\`) are used correctly
- Check that placeholder count matches the source string

### 2. Translation Quality
- Verify translations are accurate and natural-sounding
- Check for grammatical errors
- Ensure translations fit the context of a mobile app UI

### 3. Consistency
- Similar strings should have consistent translations
- Terminology should be uniform across the app
- UI element names should match platform conventions

### 4. Cultural Appropriateness
- Verify idioms are properly localized
- Check for culturally sensitive content
- Ensure date/number formats are appropriate

### 5. Length Considerations
- Flag translations that are significantly longer than source
- Consider UI space constraints for mobile apps

## Instructions
1. Use the \`get_catalog_statistics\` tool to see overall translation coverage
2. Use the \`list_all_keys\` tool to see available keys
3. Use the \`get_translations_for_key\` tool to examine specific translations
4. Report any issues found with specific keys and languages
5. Suggest corrections using the \`update_translations\` tool format

## Output Format
Provide a structured review report:
- Summary of findings
- List of issues by severity (critical, warning, suggestion)
- Recommended fixes in JSON format for the update_translations tool`,
                        },
                    },
                ],
            };
        }
    );
}
