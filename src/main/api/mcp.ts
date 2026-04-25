import { app as electronApp } from 'electron'
import { Elysia } from 'elysia'
import { queryRagIndex, upsertSnippetInRagIndex } from '../ai/rag/index'
import { useStorage } from '../storage'
import { store } from '../store'
import { importEsm } from '../utils'

interface JsonRpcRequest {
  id?: string | number | null
  method: string
  params?: Record<string, any>
  jsonrpc?: string
}

function createResult(id: JsonRpcRequest['id'], result: unknown) {
  return {
    jsonrpc: '2.0',
    id: id ?? null,
    result,
  }
}

function createError(
  id: JsonRpcRequest['id'],
  code: number,
  message: string,
  data?: unknown,
) {
  return {
    jsonrpc: '2.0',
    id: id ?? null,
    error: {
      code,
      message,
      data,
    },
  }
}

async function handleToolsCall(
  request: JsonRpcRequest,
  params?: Record<string, any>,
) {
  const toolName = String(params?.name ?? '')
  const args = (params?.arguments ?? {}) as Record<string, any>
  const storage = useStorage()

  if (toolName === 'ingest_snippet') {
    const name = String(args.name ?? 'Untitled')
    const folderId = typeof args.folderId === 'number' ? args.folderId : null
    const contents = Array.isArray(args.contents) ? args.contents : []

    if (!contents.length) {
      return createError(request.id, -32602, 'contents is required')
    }

    const { id: snippetId } = storage.snippets.createSnippet({
      folderId,
      name,
    })

    for (const content of contents) {
      storage.snippets.createSnippetContent(snippetId, {
        label: String(content.label ?? 'main'),
        language: String(content.language ?? 'text'),
        value: String(content.value ?? ''),
      })
    }

    const snippet = storage.snippets.getSnippetById(snippetId)
    if (snippet) {
      await upsertSnippetInRagIndex(snippet)
    }

    return createResult(request.id, {
      content: [{ text: JSON.stringify({ snippetId }), type: 'text' }],
      isError: false,
    })
  }

  if (toolName === 'rag_query') {
    const query = String(args.query ?? '')
    const limit = Number(args.limit ?? 8)
    const result = await queryRagIndex(query, Number.isNaN(limit) ? 8 : limit)

    return createResult(request.id, {
      content: [{ text: JSON.stringify({ items: result }), type: 'text' }],
      isError: false,
    })
  }

  return createError(request.id, -32601, `Unknown tool: ${toolName}`)
}

export async function initMcpApi() {
  const { node } = await importEsm('@elysiajs/node')
  const port = store.preferences.get('api.mcpPort')
  const app = new Elysia({ adapter: node() })

  app
    .post('/', async ({ body, status }) => {
      const request = (body ?? {}) as JsonRpcRequest

      if (!request.method) {
        return createError(request.id, -32600, 'Invalid request')
      }

      // JSON-RPC notifications have no id and expect no response.
      // The MCP spec sends `notifications/initialized` after `initialize`.
      if (request.method.startsWith('notifications/')) {
        return status(204, null)
      }

      if (request.method === 'initialize') {
        return createResult(request.id, {
          capabilities: {
            tools: {},
          },
          protocolVersion: '2024-11-05',
          serverInfo: {
            name: 'ahaCode-mcp',
            version: electronApp.getVersion(),
          },
        })
      }

      if (request.method === 'tools/list') {
        return createResult(request.id, {
          tools: [
            {
              description: 'Create snippet and append it to RAG index',
              inputSchema: {
                properties: {
                  contents: { type: 'array' },
                  folderId: { type: ['number', 'null'] },
                  name: { type: 'string' },
                },
                required: ['name', 'contents'],
                type: 'object',
              },
              name: 'ingest_snippet',
            },
            {
              description: 'Query local snippet RAG index',
              inputSchema: {
                properties: {
                  limit: { type: 'number' },
                  query: { type: 'string' },
                },
                required: ['query'],
                type: 'object',
              },
              name: 'rag_query',
            },
          ],
        })
      }

      if (request.method === 'tools/call') {
        return handleToolsCall(request, request.params)
      }

      return createError(
        request.id,
        -32601,
        `Unknown method: ${request.method}`,
      )
    })
    .listen(port)

  // eslint-disable-next-line no-console
  console.log(`\nMCP API started on port ${port}\n`)
}
