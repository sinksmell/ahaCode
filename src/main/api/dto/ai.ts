import Elysia, { t } from 'elysia'

const aiIngestSnippetContent = t.Object({
  label: t.String(),
  value: t.String(),
  language: t.String(),
})

const aiIngestMcpRequest = t.Object({
  name: t.String(),
  folderId: t.Optional(t.Union([t.Number(), t.Null()])),
  description: t.Optional(t.Union([t.String(), t.Null()])),
  tags: t.Optional(t.Array(t.String())),
  contents: t.Array(aiIngestSnippetContent, { minItems: 1 }),
})

const aiIngestMcpResponse = t.Object({
  snippetId: t.Number(),
  createdTagIds: t.Array(t.Number()),
})

const aiRagQueryRequest = t.Object({
  query: t.String(),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 50 })),
})

const aiRagQueryItem = t.Object({
  snippetId: t.Number(),
  snippetName: t.String(),
  contentId: t.Number(),
  language: t.String(),
  text: t.String(),
  score: t.Number(),
})

const aiRagQueryResponse = t.Object({
  items: t.Array(aiRagQueryItem),
})

const aiRagRebuildResponse = t.Object({
  indexed: t.Number(),
  chunksBefore: t.Number(),
  chunksAfter: t.Number(),
  chunksWritten: t.Number(),
  skippedEmpty: t.Number(),
  embedErrors: t.Number(),
  storeErrors: t.Number(),
  firstError: t.Optional(t.String()),
})

const aiRagStatusResponse = t.Object({
  chunks: t.Number(),
  dbPath: t.String(),
  embeddingDim: t.Number(),
  modelId: t.String(),
})

export const aiDTO = new Elysia().model({
  aiIngestMcpRequest,
  aiIngestMcpResponse,
  aiRagQueryRequest,
  aiRagQueryResponse,
  aiRagRebuildResponse,
  aiRagStatusResponse,
})
