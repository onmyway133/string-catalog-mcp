# string-catalog-mcp

An MCP server for working with Xcode String Catalog (.xcstrings) files. It lets AI assistants read, search, and update your iOS/macOS localization strings.

## Installation

```bash
pnpm install
pnpm build
```

## Usage with Claude Code

```bash
pnpm run mcp:add
```

Or manually add to your MCP config:

```json
{
  "mcpServers": {
    "string-catalog-mcp": {
      "command": "node",
      "args": ["/path/to/string-catalog-mcp/dist/index.js"]
    }
  }
}
```

## Available Tools

**list_supported_languages** - List all languages in a string catalog with translation coverage stats.

**get_translations_for_key** - Get all translations for a specific key across languages.

**search_keys** - Search for keys by substring match.

**list_all_keys** - List all localization keys (paginated).

**get_catalog_statistics** - Get translation coverage breakdown per language.

**update_translations** - Add or update translations. Accepts JSON structure:

```json
{
  "data": [
    {
      "key": "hello_world",
      "translations": [
        { "language": "en", "value": "Hello World" },
        { "language": "de", "value": "Hallo Welt" }
      ],
      "comment": "Greeting on home screen"
    }
  ]
}
```

iOS format placeholders (%@, %d, %lld, %f) are preserved in translations.

## License

MIT
