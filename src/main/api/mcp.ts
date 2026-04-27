import { app as electronApp } from 'electron'
import { Elysia } from 'elysia'
import { queryRagIndex, upsertSnippetInRagIndex } from '../ai/rag/index'
import { useStorage } from '../storage'
import { store } from '../store'
import { importEsm } from '../utils'
import { normalizeLanguage } from './normalizeLanguage'

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

    const invalidIndex = contents.findIndex(
      (c: any) => typeof c.value !== 'string',
    )
    if (invalidIndex !== -1) {
      return createError(
        request.id,
        -32602,
        `contents[${invalidIndex}].value is required (string). Did you mean to use "value" instead of "content"?`,
      )
    }

    const { id: snippetId } = storage.snippets.createSnippet({
      folderId,
      name,
    })

    for (const content of contents) {
      storage.snippets.createSnippetContent(snippetId, {
        label: String(content.label ?? 'main'),
        language: normalizeLanguage(String(content.language ?? 'plain_text')),
        value: String(content.value ?? ''),
      })
    }

    const snippet = storage.snippets.getSnippetById(snippetId)
    if (snippet) {
      const outcome = await upsertSnippetInRagIndex(snippet)
      if (
        outcome.reason === 'embed-error'
        || outcome.reason === 'store-error'
      ) {
        return createError(
          request.id,
          -32603,
          `RAG index failed (${outcome.reason}): ${outcome.error ?? 'unknown'}`,
        )
      }
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
              description:
                'Save a code snippet to ahaCode and add it to the local RAG search index. Each snippet can have multiple content fragments (tabs). The snippet is immediately searchable via rag_query after ingestion.',
              inputSchema: {
                type: 'object',
                required: ['name', 'contents'],
                properties: {
                  name: {
                    type: 'string',
                    description:
                      'Display name of the snippet shown in the sidebar.',
                    examples: ['HTTP retry with backoff', 'Redis cache helper'],
                  },
                  folderId: {
                    type: ['number', 'null'],
                    description:
                      'Folder ID to place the snippet in. Pass null or omit to save to the inbox.',
                    examples: [null, 42],
                  },
                  contents: {
                    type: 'array',
                    description:
                      'One or more code fragments (tabs) for this snippet. Each item MUST have "label", "language", and "value" — not "content", not "code", not "body".',
                    minItems: 1,
                    items: {
                      type: 'object',
                      required: ['label', 'language', 'value'],
                      properties: {
                        label: {
                          type: 'string',
                          description:
                            'Tab label shown in the editor. Use short identifiers like "main", "test", "handler".',
                          examples: ['main', 'test', 'handler'],
                        },
                        language: {
                          type: 'string',
                          description:
                            'Language identifier for syntax highlighting. Common aliases are accepted and normalized: "go"→"golang", "js"→"javascript", "ts"→"typescript", "py"→"python", "rs"→"rust", "cpp"→"c_cpp", "sh"/"bash"→"sh", "yml"→"yaml".',
                          examples: [
                            'go',
                            'typescript',
                            'python',
                            'rust',
                            'sh',
                          ],
                        },
                        value: {
                          type: 'string',
                          description:
                            'The full source code or text body of this fragment. This field is called "value" — do NOT use "content", "code", or "body" as the key name.',
                          examples: [
                            'func main() {\n\tfmt.Println("hello")\n}',
                          ],
                        },
                      },
                      examples: [
                        {
                          label: 'main',
                          language: 'go',
                          value: 'func main() {\n\tfmt.Println("hello")\n}',
                        },
                        {
                          label: 'handler',
                          language: 'ts',
                          value:
                            'export async function handler(req: Request) {\n  return Response.json({ ok: true })\n}',
                        },
                      ],
                    },
                    examples: [
                      [
                        {
                          label: 'main',
                          language: 'go',
                          value: 'func main() {}',
                        },
                      ],
                    ],
                  },
                },
                examples: [
                  {
                    name: 'HTTP retry with backoff',
                    folderId: null,
                    contents: [
                      {
                        label: 'main',
                        language: 'go',
                        value:
                          'func withRetry(ctx context.Context, n int, fn func() error) error {\n\tfor i := range n {\n\t\tif err := fn(); err == nil { return nil }\n\t\ttime.Sleep(time.Duration(1<<i) * 100 * time.Millisecond)\n\t}\n\treturn fn()\n}',
                      },
                    ],
                  },
                ],
              },
              name: 'ingest_snippet',
            },
            {
              description:
                'Search the local RAG index for snippets semantically similar to the query. Returns ranked results with snippet name, language, and full source code. Use this to find relevant code before writing new implementations.',
              inputSchema: {
                type: 'object',
                required: ['query'],
                properties: {
                  query: {
                    type: 'string',
                    description:
                      'Natural language or code description of what you are looking for.',
                    examples: [
                      'golang http retry',
                      'react toggle hook',
                      'redis cache read-through',
                    ],
                  },
                  limit: {
                    type: 'number',
                    description:
                      'Maximum number of results to return. Defaults to 8.',
                    examples: [5, 8, 16],
                  },
                },
                examples: [
                  { query: 'database transaction rollback pattern', limit: 5 },
                ],
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
