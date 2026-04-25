import type { SnippetRecord } from '../../../storage/contracts'
import type { RagStoreChunk, RagStoreMatch } from '../store'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// `../../utils` pulls in `electron` at the top level (BrowserWindow). Under
// vitest that resolves to the Electron binary launcher and blows up CI with
// "Electron failed to install correctly". Stub `log` — that's all rag/index
// actually consumes from utils.
vi.mock('../../../utils', () => ({
  log: () => {},
}))

// Mock the embedder so tests run without loading the 30MB ONNX model.
// The mock maps each known term to its own basis vector; cosine(a, b) = 1
// when texts share a term, 0 otherwise. Some tests also want to pause
// the "embedding" step to simulate races — `embedGate` and the helpers
// below let them do that.
let embedGate: Promise<void> | null = null
function releaseEmbedGate() {
  embedGate = null
}
function holdEmbedGate() {
  let release!: () => void
  embedGate = new Promise<void>((resolve) => {
    release = resolve
  })
  return release
}

vi.mock('../embedder', () => {
  const TERMS = ['alpha', 'beta', 'gamma', 'delta', 'epsilon']

  function vectorize(text: string) {
    const vec = new Float32Array(TERMS.length)
    const lower = text.toLowerCase()
    for (let i = 0; i < TERMS.length; i++) {
      if (lower.includes(TERMS[i])) {
        vec[i] = 1
      }
    }
    // L2 normalize
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1
    for (let i = 0; i < vec.length; i++) {
      vec[i] = vec[i] / norm
    }
    return vec
  }

  return {
    EMBEDDING_DIM: TERMS.length,
    cosineSimilarity: (a: Float32Array, b: Float32Array) => {
      let sum = 0
      for (let i = 0; i < a.length; i++) sum += a[i] * b[i]
      return sum
    },
    embedText: async (text: string) => {
      if (embedGate)
        await embedGate
      return vectorize(text)
    },
    embedTexts: async (texts: string[]) => {
      if (embedGate)
        await embedGate
      return texts.map(vectorize)
    },
  }
})

// Mock the sqlite-vec store with an in-memory equivalent so tests don't need
// the native extension loaded into a real better-sqlite3 database.
vi.mock('../store', () => {
  const chunks = new Map<number, RagStoreChunk>()

  function cosine(a: Float32Array, b: Float32Array): number {
    let sum = 0
    for (let i = 0; i < a.length; i++) sum += a[i] * b[i]
    return sum
  }

  return {
    clearAll: () => chunks.clear(),
    countChunks: () => chunks.size,
    getStoreDbPath: () => ':memory:',
    queryNearest: (query: Float32Array, limit: number): RagStoreMatch[] =>
      [...chunks.values()]
        .map(c => ({
          contentId: c.contentId,
          language: c.language,
          score: cosine(query, c.embedding),
          snippetId: c.snippetId,
          snippetName: c.snippetName,
          text: c.text,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit),
    removeBySnippetId: (snippetId: number) => {
      for (const [id, c] of chunks) {
        if (c.snippetId === snippetId)
          chunks.delete(id)
      }
    },
    upsertChunks: (rows: RagStoreChunk[]) => {
      for (const row of rows) chunks.set(row.contentId, row)
    },
  }
})

// Import after mocks are registered.
const {
  clearRagIndex,
  queryRagIndex,
  removeSnippetFromRagIndexBySnippetId,
  syncSnippetInRagIndex,
  upsertSnippetInRagIndex,
} = await import('../index')

function makeSnippet(
  id: number,
  name: string,
  contents: Array<{ id: number, value: string }>,
): SnippetRecord {
  return {
    contents: contents.map(c => ({
      id: c.id,
      label: 'main',
      language: 'text',
      value: c.value,
    })),
    createdAt: 0,
    description: null,
    folder: null,
    id,
    isDeleted: 0,
    isFavorites: 0,
    name,
    tags: [],
    updatedAt: 0,
  }
}

describe('rag index', () => {
  beforeEach(() => {
    clearRagIndex()
  })

  it('ranks snippets by cosine similarity of the query embedding', async () => {
    await upsertSnippetInRagIndex(
      makeSnippet(1, 'alpha bravo', [{ id: 11, value: 'alpha content' }]),
    )
    await upsertSnippetInRagIndex(
      makeSnippet(2, 'beta world', [{ id: 21, value: 'beta content' }]),
    )

    const results = await queryRagIndex('alpha', 5)

    expect(results).toHaveLength(1)
    expect(results[0].snippetId).toBe(1)
    expect(results[0].score).toBeGreaterThan(0)
  })

  it('skips contents with empty or whitespace-only value', async () => {
    await upsertSnippetInRagIndex(
      makeSnippet(1, 'alpha', [
        { id: 11, value: '   ' },
        { id: 12, value: 'alpha and beta' },
      ]),
    )

    const results = await queryRagIndex('alpha', 5)
    expect(results).toHaveLength(1)
    expect(results[0].contentId).toBe(12)
  })

  it('sync replaces all chunks for a snippet even when content ids change', async () => {
    await upsertSnippetInRagIndex(
      makeSnippet(1, 'first', [{ id: 11, value: 'alpha' }]),
    )

    // snippet now has a different content with a new id
    await syncSnippetInRagIndex(
      1,
      makeSnippet(1, 'first', [{ id: 99, value: 'beta' }]),
    )

    const alphaHit = await queryRagIndex('alpha', 5)
    const betaHit = await queryRagIndex('beta', 5)

    expect(alphaHit).toHaveLength(0)
    expect(betaHit).toHaveLength(1)
    expect(betaHit[0].contentId).toBe(99)
  })

  it('removeSnippetFromRagIndexBySnippetId drops all chunks for the snippet', async () => {
    await upsertSnippetInRagIndex(
      makeSnippet(1, 'first', [
        { id: 11, value: 'alpha' },
        { id: 12, value: 'alpha and beta' },
      ]),
    )
    await upsertSnippetInRagIndex(
      makeSnippet(2, 'second', [{ id: 21, value: 'gamma' }]),
    )

    removeSnippetFromRagIndexBySnippetId(1)

    const alphaHit = await queryRagIndex('alpha', 5)
    const gammaHit = await queryRagIndex('gamma', 5)

    expect(alphaHit).toHaveLength(0)
    expect(gammaHit).toHaveLength(1)
  })

  it('returns empty array for empty query', async () => {
    await upsertSnippetInRagIndex(
      makeSnippet(1, 'x', [{ id: 11, value: 'alpha' }]),
    )

    expect(await queryRagIndex('', 5)).toEqual([])
    expect(await queryRagIndex('   ', 5)).toEqual([])
  })

  it('syncSnippetInRagIndex coalesces overlapping calls so the latest snapshot wins', async () => {
    // Enqueue two syncs back-to-back for the same snippet while embedding
    // is blocked. Without per-snippet serialization the older embedding
    // could land after the newer one and leak stale vectors; the queue
    // guarantees only the latest snapshot ends up persisted.
    const release = holdEmbedGate()

    const olderPromise = syncSnippetInRagIndex(
      1,
      makeSnippet(1, 's1', [{ id: 11, value: 'alpha' }]),
    )
    const newerPromise = syncSnippetInRagIndex(
      1,
      makeSnippet(1, 's1', [{ id: 99, value: 'beta' }]),
    )

    release()
    releaseEmbedGate()
    await Promise.all([olderPromise, newerPromise])

    const alphaHit = await queryRagIndex('alpha', 5)
    const betaHit = await queryRagIndex('beta', 5)

    expect(alphaHit).toHaveLength(0)
    expect(betaHit).toHaveLength(1)
    expect(betaHit[0].contentId).toBe(99)
  })
})
