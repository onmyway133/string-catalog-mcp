import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerListSupportedLanguages } from './list-supported-languages';
import { registerGetTranslationsForKey } from './get-translations-for-key';
import { registerSearchKeys } from './search-keys';
import { registerUpdateTranslations } from './update-translations';
import { registerGetCatalogStatistics } from './get-catalog-statistics';
import { registerListAllKeys } from './list-all-keys';

export function registerAllTools(server: McpServer) {
    registerListSupportedLanguages(server);
    registerGetTranslationsForKey(server);
    registerSearchKeys(server);
    registerUpdateTranslations(server);
    registerGetCatalogStatistics(server);
    registerListAllKeys(server);
}
