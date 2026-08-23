import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerListSupportedLanguages } from './list-supported-languages';
import { registerGetTranslationsForKey } from './get-translations-for-key';
import { registerGetSourceTexts } from './get-source-texts';
import { registerSearchKeys } from './search-keys';
import { registerUpdateTranslations } from './update-translations';
import { registerGetCatalogStatistics } from './get-catalog-statistics';
import { registerListAllKeys } from './list-all-keys';
import { registerListMissingTranslations } from './list-missing-translations';
import { registerListStaleKeys } from './list-stale-keys';

export function registerAllTools(server: McpServer) {
    registerListSupportedLanguages(server);
    registerGetTranslationsForKey(server);
    registerGetSourceTexts(server);
    registerSearchKeys(server);
    registerUpdateTranslations(server);
    registerGetCatalogStatistics(server);
    registerListAllKeys(server);
    registerListMissingTranslations(server);
    registerListStaleKeys(server);
}
