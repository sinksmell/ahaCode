import path from 'node:path'
import process from 'node:process'
import { app as electronApp } from 'electron'
import { importEsm } from '../../utils'

export const MODEL_ID = 'Xenova/bge-small-en-v1.5'
export const EMBEDDING_DIM = 384

type FeatureExtractor = (
  input: string | string[],
  options?: Record<string, unknown>,
) => Promise<{ data: Float32Array, dims: number[] }>

let extractorPromise: Promise<FeatureExtractor> | null = null

function configureEnv(env: {
  allowLocalModels?: boolean
  allowRemoteModels?: boolean
  cacheDir?: string
  localModelPath?: string
}) {
  if (electronApp.isPackaged) {
    // Use the model bundled via electron-builder extraResources. The prepare
    // script lays files out under <resources>/models/Xenova/... so the repo id
    // resolves directly against localModelPath.
    env.localModelPath = path.join(process.resourcesPath, 'models')
    env.allowLocalModels = true
    env.allowRemoteModels = false
  }
  else {
    try {
      // Dev: cache under userData so repeated launches skip the download.
      env.cacheDir = electronApp.getPath('userData')
    }
    catch {
      // electronApp.getPath can throw if app isn't ready; fall back to default.
    }
  }
}

async function createExtractor(): Promise<FeatureExtractor> {
  const transformers = await importEsm('@huggingface/transformers')

  configureEnv(transformers.env)

  return transformers.pipeline('feature-extraction', MODEL_ID, {
    // quantized weights keep the download ~30MB instead of ~100MB
    dtype: 'q8',
  })
}

function getExtractor(): Promise<FeatureExtractor> {
  if (!extractorPromise) {
    extractorPromise = createExtractor().catch((error) => {
      // reset so a later call can retry after a transient failure
      extractorPromise = null
      throw error
    })
  }
  return extractorPromise
}

export async function embedText(text: string): Promise<Float32Array> {
  const extractor = await getExtractor()
  const output = await extractor(text, { pooling: 'mean', normalize: true })
  // clone: underlying buffer may be reused by subsequent calls
  return new Float32Array(output.data)
}

export async function embedTexts(texts: string[]): Promise<Float32Array[]> {
  if (!texts.length) {
    return []
  }

  const extractor = await getExtractor()
  const output = await extractor(texts, { pooling: 'mean', normalize: true })
  const [count, dim] = output.dims

  const result: Float32Array[] = []
  for (let i = 0; i < count; i++) {
    result.push(new Float32Array(output.data.buffer, i * dim * 4, dim).slice())
  }
  return result
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  // vectors are L2-normalized by the pipeline, so dot product == cosine
  if (a.length !== b.length) {
    return 0
  }

  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i]
  }
  return sum
}
