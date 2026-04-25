import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { app as electronApp } from 'electron'
import { Elysia } from 'elysia'
import { store } from '../store'
import { importEsm } from '../utils'
import ai from './routes/ai'
import folders from './routes/folders'
import snippets from './routes/snippets'
import system from './routes/system'
import tags from './routes/tags'

export async function initApi() {
  // поскольку @elysiajs/node использует crossws, который работает только в ESM среде,
  // то делаем хак с динамическим импортом
  const { node } = await importEsm('@elysiajs/node')

  const app = new Elysia({ adapter: node() })
  const port = store.preferences.get('api.port')

  app
    .use(cors({ origin: '*' }))
    .use(
      swagger({
        documentation: {
          info: {
            title: 'ahaCode API',
            version: electronApp.getVersion(),
          },
        },
      }),
    )
    .use(snippets)
    .use(folders)
    .use(system)
    .use(tags)
    .use(ai)
    .listen(port)

  // eslint-disable-next-line no-console
  console.log(`\nAPI started on port ${port}\n`)
}
