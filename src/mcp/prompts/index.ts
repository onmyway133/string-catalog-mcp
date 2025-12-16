import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTranslateStringsPrompt } from './translate-strings';
import { registerReviewTranslationsPrompt } from './review-translations';
import { registerBatchTranslatePrompt } from './batch-translate';

export function registerAllPrompts(server: McpServer) {
    registerTranslateStringsPrompt(server);
    registerReviewTranslationsPrompt(server);
    registerBatchTranslatePrompt(server);
}
