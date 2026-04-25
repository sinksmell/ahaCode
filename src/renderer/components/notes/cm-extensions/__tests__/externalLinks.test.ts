import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  extractExternalUrlAtOffset,
  findExternalUrlAtCoords,
  handleExternalLinkClick,
  handleExternalLinkMouseDown,
  isExternalLinkNavigationEnabled,
  isSupportedExternalUrl,
} from '../externalLinks'

const { invoke } = vi.hoisted(() => ({
  invoke: vi.fn(async () => undefined),
}))

vi.mock('@/electron', () => ({
  ipc: {
    invoke,
  },
}))

vi.mock('@/utils', () => ({
  isMac: true,
}))

function createView(lineText: string, pos = 3) {
  return {
    posAtCoords: vi.fn(() => pos),
    state: {
      doc: {
        lineAt: vi.fn(() => ({
          from: 0,
          text: lineText,
        })),
      },
    },
  } as any
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('extractExternalUrlAtOffset', () => {
  it('extracts markdown link url when clicking inside the label', () => {
    expect(
      extractExternalUrlAtOffset('[Docs](https://github.com/sinksmell/ahaCode)', 3),
    ).toBe('https://github.com/sinksmell/ahaCode')
  })

  it('extracts plain url when clicking inside the url text', () => {
    expect(
      extractExternalUrlAtOffset('Docs https://github.com/sinksmell/ahaCode now', 12),
    ).toBe('https://github.com/sinksmell/ahaCode')
  })

  it('returns null when offset is outside a link', () => {
    expect(
      extractExternalUrlAtOffset('Docs https://github.com/sinksmell/ahaCode now', 1),
    ).toBeNull()
  })
})

describe('isSupportedExternalUrl', () => {
  it('accepts supported protocols', () => {
    expect(isSupportedExternalUrl('https://github.com/sinksmell/ahaCode')).toBe(true)
    expect(isSupportedExternalUrl('http://github.com/sinksmell/ahaCode')).toBe(true)
    expect(isSupportedExternalUrl('ahacode://notes-asset/example.png')).toBe(
      true,
    )
  })

  it('rejects unsupported protocols', () => {
    expect(isSupportedExternalUrl('mailto:test@example.com')).toBe(false)
    expect(isSupportedExternalUrl('/notes/example.md')).toBe(false)
  })
})

describe('isExternalLinkNavigationEnabled', () => {
  it('keeps external links clickable in live preview', () => {
    expect(isExternalLinkNavigationEnabled('livePreview')).toBe(true)
  })

  it('keeps external links clickable in preview', () => {
    expect(isExternalLinkNavigationEnabled('preview')).toBe(true)
  })

  it('does not enable navigation in raw mode', () => {
    expect(isExternalLinkNavigationEnabled('raw')).toBe(false)
  })
})

describe('findExternalUrlAtCoords', () => {
  it('returns supported url for the clicked position', () => {
    expect(
      findExternalUrlAtCoords(createView('[Docs](https://github.com/sinksmell/ahaCode)'), {
        x: 20,
        y: 10,
      }),
    ).toBe('https://github.com/sinksmell/ahaCode')
  })

  it('returns null when clicked text is not an external url', () => {
    expect(
      findExternalUrlAtCoords(createView('[[Internal note]]'), {
        x: 20,
        y: 10,
      }),
    ).toBeNull()
  })
})

describe('external link mouse handlers', () => {
  it('opens the external url on cmd+mousedown', () => {
    const preventDefault = vi.fn()

    const handled = handleExternalLinkMouseDown(
      createView('[Docs](https://github.com/sinksmell/ahaCode)'),
      {
        clientX: 10,
        clientY: 20,
        ctrlKey: false,
        metaKey: true,
        preventDefault,
      } as unknown as MouseEvent,
    )

    expect(handled).toBe(true)
    expect(preventDefault).toHaveBeenCalledTimes(1)
    expect(invoke).toHaveBeenCalledWith(
      'system:open-external',
      'https://github.com/sinksmell/ahaCode',
    )
  })

  it('does not open the external url on plain mousedown', () => {
    const preventDefault = vi.fn()

    const handled = handleExternalLinkMouseDown(
      createView('[Docs](https://github.com/sinksmell/ahaCode)'),
      {
        clientX: 10,
        clientY: 20,
        ctrlKey: false,
        metaKey: false,
        preventDefault,
      } as unknown as MouseEvent,
    )

    expect(handled).toBe(false)
    expect(preventDefault).not.toHaveBeenCalled()
    expect(invoke).not.toHaveBeenCalled()
  })

  it('suppresses the follow-up click for cmd+click', () => {
    const preventDefault = vi.fn()

    const handled = handleExternalLinkClick(
      createView('[Docs](https://github.com/sinksmell/ahaCode)'),
      {
        clientX: 10,
        clientY: 20,
        ctrlKey: false,
        metaKey: true,
        preventDefault,
      } as unknown as MouseEvent,
    )

    expect(handled).toBe(true)
    expect(preventDefault).toHaveBeenCalledTimes(1)
    expect(invoke).not.toHaveBeenCalled()
  })

  it('does not suppress plain click on external link', () => {
    const preventDefault = vi.fn()

    const handled = handleExternalLinkClick(
      createView('[Docs](https://github.com/sinksmell/ahaCode)'),
      {
        clientX: 10,
        clientY: 20,
        ctrlKey: false,
        metaKey: false,
        preventDefault,
      } as unknown as MouseEvent,
    )

    expect(handled).toBe(false)
    expect(preventDefault).not.toHaveBeenCalled()
    expect(invoke).not.toHaveBeenCalled()
  })
})
