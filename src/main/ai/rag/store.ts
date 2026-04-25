import type { Database as DatabaseType } from 'better-sqlite3'
import { Buffer } from 'node:buffer'
import path from 'node:path'
import BetterSqlite3 from 'better-sqlite3'
import { app as electronApp } from 'electron'
import * as sqliteVec from 'sqlite-vec'
import { EMBEDDING_DIM } from './embedder'

export interface RagStoreChunk {
  contentId: number
  embedding: Float32Array
  label: string
  language: string
  snippetId: number
  snippetName: string
  text: string
}

export interface RagStoreMatch {
  contentId: number
  language: string
  score: number
  snippetId: number
  snippetName: string
  text: string
}

let db: DatabaseType | null = null

function getDbPath() {
  return path.join(electronApp.getPath('userData'), 'rag-index.db')
}

export function getStoreDbPath() {
  return getDbPath()
}

function getDb(): DatabaseType {
  if (db) {
    return db
  }

  const instance = new BetterSqlite3(getDbPath())
  sqliteVec.load(instance)

  instance.exec(`
    CREATE TABLE IF NOT EXISTS rag_chunks (
      content_id INTEGER PRIMARY KEY,
      snippet_id INTEGER NOT NULL,
      snippet_name TEXT NOT NULL,
      label TEXT NOT NULL,
      language TEXT NOT NULL,
      text TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rag_snippet ON rag_chunks(snippet_id);
    CREATE VIRTUAL TABLE IF NOT EXISTS rag_vec USING vec0(
      content_id INTEGER PRIMARY KEY,
      embedding float[${EMBEDDING_DIM}] distance_metric=cosine
    );
  `)

  db = instance
  return instance
}

function toBuffer(vec: Float32Array): Buffer {
  // Ensure we own a contiguous buffer for the exact vector slice.
  return Buffer.from(vec.buffer, vec.byteOffset, vec.byteLength)
}

export function upsertChunks(chunks: RagStoreChunk[]) {
  if (!chunks.length) {
    return
  }

  const instance = getDb()
  const upsertMeta = instance.prepare(`
    INSERT INTO rag_chunks (content_id, snippet_id, snippet_name, label, language, text)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(content_id) DO UPDATE SET
      snippet_id = excluded.snippet_id,
      snippet_name = excluded.snippet_name,
      label = excluded.label,
      language = excluded.language,
      text = excluded.text
  `)
  // vec0 virtual tables don't support ON CONFLICT; delete-then-insert instead.
  const deleteVec = instance.prepare(
    `DELETE FROM rag_vec WHERE content_id = ?`,
  )
  const insertVec = instance.prepare(
    `INSERT INTO rag_vec (content_id, embedding) VALUES (?, ?)`,
  )

  const tx = instance.transaction((rows: RagStoreChunk[]) => {
    for (const row of rows) {
      // vec0's primary key column is strict about SQLITE_INTEGER bindings.
      // better-sqlite3 ships JS Number through sqlite3_bind_double, which
      // vec0 rejects, so we go through BigInt to force an int64 binding.
      const contentIdBig = BigInt(row.contentId)
      upsertMeta.run(
        contentIdBig,
        row.snippetId,
        row.snippetName,
        row.label,
        row.language,
        row.text,
      )
      deleteVec.run(contentIdBig)
      insertVec.run(contentIdBig, toBuffer(row.embedding))
    }
  })

  tx(chunks)
}

export function removeBySnippetId(snippetId: number) {
  const instance = getDb()
  const rows = instance
    .prepare(`SELECT content_id FROM rag_chunks WHERE snippet_id = ?`)
    .all(snippetId) as { content_id: number | bigint }[]

  if (!rows.length) {
    return
  }

  const deleteMeta = instance.prepare(
    `DELETE FROM rag_chunks WHERE content_id = ?`,
  )
  const deleteVec = instance.prepare(
    `DELETE FROM rag_vec WHERE content_id = ?`,
  )

  const tx = instance.transaction((ids: bigint[]) => {
    for (const id of ids) {
      deleteMeta.run(id)
      deleteVec.run(id)
    }
  })

  tx(rows.map(r => BigInt(r.content_id)))
}

export function clearAll() {
  const instance = getDb()
  instance.exec(`DELETE FROM rag_chunks; DELETE FROM rag_vec;`)
}

export function countChunks(): number {
  const row = getDb()
    .prepare(`SELECT COUNT(*) as count FROM rag_chunks`)
    .get() as { count: number }
  return row.count
}

export function queryNearest(
  query: Float32Array,
  limit: number,
): RagStoreMatch[] {
  const instance = getDb()

  if (countChunks() === 0) {
    return []
  }

  // sqlite-vec's cosine distance = 1 - cosine_similarity, so subtract to
  // return a 0..1 similarity score consistent with the previous implementation.
  const rows = instance
    .prepare(
      `
      SELECT
        c.content_id as contentId,
        c.snippet_id as snippetId,
        c.snippet_name as snippetName,
        c.language,
        c.text,
        v.distance as distance
      FROM rag_vec v
      JOIN rag_chunks c ON c.content_id = v.content_id
      WHERE v.embedding MATCH ? AND k = ?
      ORDER BY v.distance
    `,
    )
    .all(toBuffer(query), limit) as Array<{
    contentId: number | bigint
    distance: number
    language: string
    snippetId: number | bigint
    snippetName: string
    text: string
  }>

  return rows.map(row => ({
    contentId: Number(row.contentId),
    language: row.language,
    score: 1 - row.distance,
    snippetId: Number(row.snippetId),
    snippetName: row.snippetName,
    text: row.text,
  }))
}

export function closeStore() {
  if (db) {
    db.close()
    db = null
  }
}
