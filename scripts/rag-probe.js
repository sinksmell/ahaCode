// End-to-end smoke test for the sqlite-vec store layer.
//   Usage: npx electron scripts/rag-probe.js
const { Buffer } = require('node:buffer')
const process = require('node:process')
const Database = require('better-sqlite3')
const vec = require('sqlite-vec')

const db = new Database(':memory:')
vec.load(db)

const DIM = 4
db.exec(`
  CREATE TABLE rag_chunks (
    content_id INTEGER PRIMARY KEY,
    snippet_id INTEGER NOT NULL,
    text TEXT NOT NULL
  );
  CREATE VIRTUAL TABLE rag_vec USING vec0(
    content_id INTEGER PRIMARY KEY,
    embedding float[${DIM}] distance_metric=cosine
  );
`)

function buf(values) {
  const v = Float32Array.from(values)
  return Buffer.from(v.buffer, v.byteOffset, v.byteLength)
}

const insMeta = db.prepare('INSERT INTO rag_chunks VALUES (?, ?, ?)')
const insVec = db.prepare(
  'INSERT INTO rag_vec (content_id, embedding) VALUES (?, ?)',
)

const rows = [
  { id: 11, snippet: 1, text: 'alpha', vec: [1, 0, 0, 0] },
  { id: 12, snippet: 1, text: 'alpha beta', vec: [0.707, 0.707, 0, 0] },
  { id: 21, snippet: 2, text: 'gamma', vec: [0, 0, 1, 0] },
]

for (const row of rows) {
  const id = BigInt(row.id)
  insMeta.run(id, BigInt(row.snippet), row.text)
  insVec.run(id, buf(row.vec))
}

console.log('chunks:', db.prepare('SELECT COUNT(*) c FROM rag_chunks').get())
console.log('vec:   ', db.prepare('SELECT COUNT(*) c FROM rag_vec').get())

const queryVec = buf([1, 0, 0, 0])
const matches = db
  .prepare(
    `SELECT c.content_id, c.text, v.distance
     FROM rag_vec v JOIN rag_chunks c ON c.content_id = v.content_id
     WHERE v.embedding MATCH ? AND k = ?
     ORDER BY v.distance`,
  )
  .all(queryVec, 3)

console.log('matches for [1,0,0,0]:')
for (const m of matches) {
  console.log(
    ' ',
    m.text,
    'distance=',
    m.distance.toFixed(4),
    'score=',
    (1 - m.distance).toFixed(4),
  )
}
process.exit(0)
