---
title: MCP Server
description: "Use the ahaCode MCP server to search and create snippets from any MCP-compatible AI client with local RAG-powered semantic search."
---

# MCP Server

ahaCode includes a built-in [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server. It exposes your snippet library to any MCP-compatible client so you can search and create snippets without leaving your AI workflow.

## How it works

- ahaCode runs a JSON-RPC server on `http://127.0.0.1:4322/` (localhost only).
- A local embedding model (`bge-small-en-v1.5`, ~30 MB) generates vector embeddings on-device.
- Embeddings are stored in a `sqlite-vec` vector database for cosine similarity search.
- The RAG index auto-syncs whenever you create, update, or delete snippets.
- **No API keys required.** Everything runs locally — no data leaves your machine.

## Tools

The MCP server exposes two tools:

### `rag_query`

Search your snippet library with natural language.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | required | Natural language search query |
| `limit` | number | 8 | Maximum number of results |

Returns ranked snippets with semantic similarity scores.

### `ingest_snippet`

Create a new snippet and automatically add it to the RAG index.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | string | required | Snippet name |
| `contents` | array | required | Array of `{ label, language, value }` objects |
| `folderId` | number \| null | null | Target folder ID |

Returns the new snippet ID.

## Configuration

The MCP server port is configurable in **Preferences → API → MCP Port** (default: `4322`, valid range: 1024–65535). ahaCode must be running for clients to connect.

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "ahaCode": {
      "url": "http://127.0.0.1:4322/"
    }
  }
}
```

### Cursor

Add in Settings → MCP or edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "ahaCode": {
      "url": "http://127.0.0.1:4322/"
    }
  }
}
```

### Claude Code

Add to `.mcp.json` in your project or global config:

```json
{
  "mcpServers": {
    "ahaCode": {
      "type": "http",
      "url": "http://127.0.0.1:4322/"
    }
  }
}
```

### Zed

Add to `settings.json`:

```json
{
  "context_servers": {
    "ahaCode": {
      "source": "custom",
      "url": "http://127.0.0.1:4322/"
    }
  }
}
```

## Verifying the Connection

Run this command to check that the MCP server is running:

```bash
curl -s http://127.0.0.1:4322/ \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

A successful response lists both `rag_query` and `ingest_snippet` tools.
