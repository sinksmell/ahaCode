// Pre-download the bge-small-en ONNX model + tokenizer into build/models/ so
// electron-builder can bundle it as extraResources. At runtime the main
// process points transformers.js at this bundled copy via localModelPath.
//
// Run manually: `node scripts/prepare-model.mjs`
// Run as part of a build: invoked from the `build:*` npm scripts.
import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const MODEL_ID = 'Xenova/bge-small-en-v1.5'
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = path.join(projectRoot, 'build', 'models')
// transformers.js downloads into <cacheDir>/<repo>/, so MODEL_ID under outputDir
// gives us the layout expected at runtime (<resources>/models/Xenova/...).
const markerFile = path.join(outputDir, MODEL_ID, 'config.json')

if (existsSync(markerFile) && !process.env.FORCE_MODEL_DOWNLOAD) {
  console.log(`[prepare-model] ${MODEL_ID} already present at ${outputDir}`)
  process.exit(0)
}

await mkdir(outputDir, { recursive: true })

const transformers = await import('@huggingface/transformers')
transformers.env.cacheDir = outputDir
transformers.env.allowRemoteModels = true

console.log(`[prepare-model] downloading ${MODEL_ID} into ${outputDir} ...`)

// Instantiating the pipeline triggers the downloads we need (config, tokenizer,
// onnx weights). q8 matches the runtime config in src/main/ai/rag/embedder.ts.
await transformers.pipeline('feature-extraction', MODEL_ID, { dtype: 'q8' })

console.log(`[prepare-model] done`)
