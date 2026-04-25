import { useApp, useSnippets } from '@/composables'
import { ipc } from '@/electron'
import { getActiveSpaceId } from '@/spaceDefinitions'
import { createMainMenuContext } from './context'

const {
  codeLayoutMode,
  isCompactListMode,
  isShowCodePreview,
  isShowJsonVisualizer,
} = useApp()
const { isAvailableToCodePreview, selectedSnippetContent } = useSnippets()

export function registerMainMenuContextSync() {
  watch(
    () =>
      [
        getActiveSpaceId(),
        codeLayoutMode.value,
        isCompactListMode.value,
        isAvailableToCodePreview.value,
        selectedSnippetContent.value?.language,
        isShowCodePreview.value,
        isShowJsonVisualizer.value,
      ] as const,
    () => {
      ipc.send(
        'main-menu:update-context',
        createMainMenuContext({
          activeSpaceId: getActiveSpaceId(),
          compactListMode: isCompactListMode.value,
          code: {
            canPreviewCode: isAvailableToCodePreview.value,
            canPreviewJson: selectedSnippetContent.value?.language === 'json',
            isCodePreviewShown: isShowCodePreview.value,
            isJsonPreviewShown: isShowJsonVisualizer.value,
            layoutMode: codeLayoutMode.value,
          },
        }),
      )
    },
    { immediate: true },
  )
}
