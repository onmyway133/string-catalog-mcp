#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerAllTools } from './mcp/tools/index';
import { registerAllPrompts } from './mcp/prompts/index';

const server = new McpServer({
    name: 'string-catalog-mcp',
    version: '1.0.0',
});

registerAllTools(server);
registerAllPrompts(server);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('String Catalog MCP Server running on stdio');
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
