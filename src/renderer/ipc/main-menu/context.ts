import type { LayoutMode } from '@/composables/layoutModes'
import type { SpaceId } from '@/spaceDefinitions'
import type { MainMenuContext, MainMenuLayoutMode } from '~/main/types/menu'

interface CodeMenuState {
  layoutMode: LayoutMode
  canPreviewCode: boolean
  isCodePreviewShown: boolean
  canPreviewJson: boolean
  isJsonPreviewShown: boolean
}

interface CreateMainMenuContextOptions {
  activeSpaceId: SpaceId | null
  compactListMode: boolean
  code: CodeMenuState
}

const sharedLayoutModes: MainMenuLayoutMode[] = [
  'all-panels',
  'list-editor',
  'editor-only',
]

export function createMainMenuContext(
  options: CreateMainMenuContextOptions,
): MainMenuContext {
  if (options.activeSpaceId === 'code') {
    return {
      file: {
        primaryAction: 'new-snippet',
        secondaryAction: 'new-folder',
        canCreateFragment: true,
      },
      view: {
        layoutMode: options.code.layoutMode,
        layoutModes: sharedLayoutModes,
        canToggleCompactMode: true,
        canToggleMindmap: false,
        isCompactMode: options.compactListMode,
        isMindmapShown: false,
        canTogglePresentation: false,
        isPresentationShown: false,
      },
      editor: {
        kind: 'code',
        noteMode: null,
        canFormat: true,
        canPreviewCode: options.code.canPreviewCode,
        isCodePreviewShown: options.code.isCodePreviewShown,
        canPreviewJson: options.code.canPreviewJson,
        isJsonPreviewShown: options.code.isJsonPreviewShown,
        canAdjustFontSize: true,
      },
    }
  }

  return {
    file: {
      primaryAction: null,
      secondaryAction: null,
      canCreateFragment: false,
    },
    view: {
      layoutMode: null,
      layoutModes: [],
      canToggleCompactMode: false,
      canToggleMindmap: false,
      isCompactMode: false,
      isMindmapShown: false,
      canTogglePresentation: false,
      isPresentationShown: false,
    },
    editor: {
      kind: null,
      noteMode: null,
      canFormat: false,
      canPreviewCode: false,
      isCodePreviewShown: false,
      canPreviewJson: false,
      isJsonPreviewShown: false,
      canAdjustFontSize: false,
    },
  }
}
