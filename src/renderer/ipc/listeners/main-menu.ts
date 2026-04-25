import type { MainMenuLayoutMode } from '~/main/types/menu'
import { useApp, useEditor, useFolders, useSnippets } from '@/composables'
import { ipc } from '@/electron'
import { navigateBack, navigateForward } from '@/ipc/listeners/deepLinks'
import { router, RouterName } from '@/router'
import { getActiveSpaceId } from '@/spaceDefinitions'
import { EDITOR_DEFAULTS } from '~/main/store/constants'
import { registerMainMenuContextSync } from '../main-menu/sync'

const { createSnippetAndSelect, addFragment } = useSnippets()
const { createFolderAndSelect } = useFolders()
const { settings: editorSettings } = useEditor()
const {
  isShowCodePreview,
  isShowJsonVisualizer,
  setCodeLayoutMode,
  toggleCompactListMode,
  toggleCodeSidebar,
} = useApp()

export function registerMainMenuListeners() {
  registerMainMenuContextSync()

  ipc.on('main-menu:goto-preferences', () => {
    router.push({ name: RouterName.preferences })
  })

  ipc.on('main-menu:goto-devtools', () => {
    router.push({ name: RouterName.main })
  })

  ipc.on('main-menu:navigate-back', () => {
    void navigateBack()
  })

  ipc.on('main-menu:navigate-forward', () => {
    void navigateForward()
  })

  ipc.on('main-menu:new-snippet', () => {
    createSnippetAndSelect()
  })

  ipc.on('main-menu:new-fragment', () => {
    addFragment()
  })

  ipc.on('main-menu:new-folder', () => {
    createFolderAndSelect()
  })

  ipc.on('main-menu:preview-code', () => {
    isShowCodePreview.value = !isShowCodePreview.value
  })

  ipc.on('main-menu:preview-json', () => {
    isShowJsonVisualizer.value = !isShowJsonVisualizer.value
  })

  ipc.on('main-menu:toggle-sidebar', () => {
    const activeSpaceId = getActiveSpaceId()

    if (activeSpaceId === 'code') {
      toggleCodeSidebar()
    }
  })

  ipc.on('main-menu:toggle-compact-mode', () => {
    const activeSpaceId = getActiveSpaceId()

    if (activeSpaceId === 'code') {
      toggleCompactListMode()
    }
  })

  ipc.on('main-menu:goto-math-notebook', () => {
    router.push({ name: RouterName.main })
  })

  ipc.on('main-menu:set-layout-mode', (_, layoutMode?: MainMenuLayoutMode) => {
    if (!layoutMode) {
      return
    }

    const activeSpaceId = getActiveSpaceId()

    if (activeSpaceId === 'code') {
      setCodeLayoutMode(layoutMode)
    }
  })

  ipc.on('main-menu:font-size-increase', () => {
    editorSettings.fontSize++
  })

  ipc.on('main-menu:font-size-decrease', () => {
    editorSettings.fontSize--
  })

  ipc.on('main-menu:font-size-reset', () => {
    editorSettings.fontSize = EDITOR_DEFAULTS.fontSize
  })
}
