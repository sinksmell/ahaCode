import { beforeEach, describe, expect, it, vi } from 'vitest'

async function loadSpaceDefinitions() {
  vi.resetModules()

  vi.doMock('@/electron', () => ({
    i18n: {
      t: (value: string) => value,
    },
  }))

  vi.doMock('@/router', () => ({
    RouterName: {
      main: 'main',
      notesSpace: 'notes-space',
      notesDashboard: 'notes-space/dashboard',
      notesGraph: 'notes-space/graph',
      mathNotebook: 'math-notebook',
      devtools: 'devtools',
    },
    router: {
      currentRoute: {
        value: {
          name: null,
        },
      },
    },
  }))

  return import('../spaceDefinitions')
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('spaceDefinitions', () => {
  it('returns only Code space definition', async () => {
    const { getSpaceDefinitions } = await loadSpaceDefinitions()

    expect(getSpaceDefinitions()).toEqual([
      expect.objectContaining({
        id: 'code',
        to: { name: 'main' },
      }),
    ])
  })
})
