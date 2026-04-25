import type { SnippetRecord } from '../../storage/contracts'
import type { RagStoreChunk } from './store'
import { log } from '../../utils'
import { embedText, embedTexts } from './embedder'
import {
  clearAll,
  countChunks,
  getStoreDbPath,
  queryNearest,
  removeBySnippetId,
  upsertChunks,
} from './store'

export interface RagChunk {
  contentId: number
  language: string
  snippetId: number
  snippetName: string
  text: string
}

function buildChunkText(snippetName: string, label: string, value: string) {
  // Prepend snippet context so chunks without much body text still match.
  return `${snippetName}\n${label}\n${value}`.trim()
}

export function clearRagIndex() {
  clearAll()
}

export function getRagIndexStatus() {
  return {
    chunks: countChunks(),
    dbPath: getStoreDbPath(),
  }
}

export interface UpsertOutcome {
  chunksWritten: number
  reason?: 'empty' | 'embed-error' | 'store-error'
  error?: string
}

export async function upsertSnippetInRagIndex(
  snippet: SnippetRecord,
): Promise<UpsertOutcome> {
  const contents = snippet.contents.filter(
    (content): content is typeof content & { value: string } =>
      typeof content.value === 'string' && content.value.trim().length > 0,
  )

  if (!contents.length) {
    return { chunksWritten: 0, reason: 'empty' }
  }

  const texts = contents.map(content =>
    buildChunkText(snippet.name, content.label, content.value),
  )

  let embeddings: Float32Array[]
  try {
    embeddings = await embedTexts(texts)
  }
  catch (error) {
    log('rag.embedTexts', error)
    return {
      chunksWritten: 0,
      reason: 'embed-error',
      error: error instanceof Error ? error.message : String(error),
    }
  }

  const rows: RagStoreChunk[] = contents.map((content, i) => ({
    contentId: content.id,
    embedding: embeddings[i],
    label: content.label,
    language: content.language,
    snippetId: snippet.id,
    snippetName: snippet.name,
    text: content.value,
  }))

  try {
    upsertChunks(rows)
  }
  catch (error) {
    log('rag.upsertChunks', error)
    return {
      chunksWritten: 0,
      reason: 'store-error',
      error: error instanceof Error ? error.message : String(error),
    }
  }

  return { chunksWritten: rows.length }
}

export function removeSnippetFromRagIndexBySnippetId(snippetId: number) {
  removeBySnippetId(snippetId)
}

// Per-snippet serialization state. Two close edits to the same snippet fire
// two async sync jobs; without a queue the older embed response can land
// after the newer one, leaving /ai/rag/query with stale vectors. We chain
// all jobs for a given snippet so they run in order, and coalesce aggressively:
// if a newer enqueue supersedes an older one, the older job becomes a no-op
// (the newer one will reflect the current snapshot anyway).
const syncChainBySnippet = new Map<number, Promise<unknown>>()
const syncSeqBySnippet = new Map<number, number>()

export function syncSnippetInRagIndex(
  snippetId: number,
  snippet: SnippetRecord | null,
): Promise<void> {
  const mySeq = (syncSeqBySnippet.get(snippetId) ?? 0) + 1
  syncSeqBySnippet.set(snippetId, mySeq)

  const previous = syncChainBySnippet.get(snippetId) ?? Promise.resolve()
  const next: Promise<void> = previous
    .then(async () => {
      // A newer sync for this snippet was enqueued after us — skip and let
      // the latest snapshot win. Avoids wasting an embedding call on a
      // state we know is already stale.
      if (syncSeqBySnippet.get(snippetId) !== mySeq) {
        return
      }
      removeBySnippetId(snippetId)
      if (snippet) {
        await upsertSnippetInRagIndex(snippet)
      }
    })
    .catch((error) => {
      log('rag.syncSnippet', error)
    })

  syncChainBySnippet.set(snippetId, next)

  void next.finally(() => {
    // Release the slot only if this was the last enqueued job; otherwise
    // a later one is still chained behind us and needs the map entry.
    if (syncChainBySnippet.get(snippetId) === next) {
      syncChainBySnippet.delete(snippetId)
      syncSeqBySnippet.delete(snippetId)
    }
  })

  return next
}

export async function queryRagIndex(query: string, limit: number) {
  const trimmed = query.trim()
  if (!trimmed) {
    return []
  }

  let queryVec: Float32Array
  try {
    queryVec = await embedText(trimmed)
  }
  catch (error) {
    log('rag.embedText', error)
    return []
  }

  return queryNearest(queryVec, limit).filter(match => match.score > 0)
}
