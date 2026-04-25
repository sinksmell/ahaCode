// List snippets that got skipped by the RAG indexer because all their
// contents were empty/whitespace. Run against the packaged vault or the
// dev sqlite db. Usage:
//   npx electron scripts/rag-list-skipped.js
const os = require('node:os')
const path = require('node:path')
const process = require('node:process')
const Database = require('better-sqlite3')

const ragPath
  = process.env.RAG_DB
    || path.join(os.homedir(), 'Library/Application Support/ahaCode/rag-index.db')

// ahaCode's sqlite engine lives in a separate file; markdown engine has no
// single sqlite db, so this probe only works when storage engine === "sqlite".
const storePath
  = process.env.STORE_DB
    || path.join(os.homedir(), 'Library/Application Support/ahaCode/db.json')

console.log('rag db :', ragPath)
console.log('store  :', storePath, '(only used for sqlite engine)')

const rag = new Database(ragPath, { readonly: true })
const indexedIds = new Set(
  rag
    .prepare('SELECT DISTINCT snippet_id FROM rag_chunks')
    .all()
    .map(r => Number(r.snippet_id)),
)
rag.close()

console.log(
  'indexed snippetIds:',
  [...indexedIds].sort((a, b) => a - b),
)
console.log(
  '-> cross-reference in the app: snippets NOT in this list had only empty contents',
)
