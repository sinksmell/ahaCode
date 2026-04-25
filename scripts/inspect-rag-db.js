// One-off inspector for the RAG sqlite-vec database.
//   Usage: DB_PATH=... npx electron scripts/inspect-rag-db.js
const os = require('node:os')
const path = require('node:path')
const process = require('node:process')
const Database = require('better-sqlite3')
const vec = require('sqlite-vec')

const dbPath
  = process.env.DB_PATH
    || path.join(os.homedir(), 'Library/Application Support/ahaCode/rag-index.db')

console.log('[inspect-rag-db] opening', dbPath)
const db = new Database(dbPath, { readonly: true })
vec.load(db)

const chunks = db.prepare('SELECT COUNT(*) AS c FROM rag_chunks').get()
const vecCount = db.prepare('SELECT COUNT(*) AS c FROM rag_vec').get()
console.log('rag_chunks count:', chunks.c)
console.log('rag_vec    count:', vecCount.c)

const sample = db
  .prepare(
    `SELECT content_id, snippet_id, snippet_name, language, length(text) AS len
     FROM rag_chunks ORDER BY content_id LIMIT 5`,
  )
  .all()
console.log('sample rows:', sample)

db.close()
process.exit(0)
