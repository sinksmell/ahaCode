<script setup lang="ts">
import { useResizeHandle } from '@/composables'
import { LAYOUT_DEFAULTS } from '~/main/store/constants'

const props = withDefaults(
  defineProps<{
    showSidebar: boolean
    showList: boolean
    sidebarWidth?: number
    listWidth?: number
    headerGap?: number
  }>(),
  {
    sidebarWidth: LAYOUT_DEFAULTS.sidebar.width,
    listWidth: LAYOUT_DEFAULTS.list.width,
    headerGap: 0,
  },
)

const emit = defineEmits<{
  resizeEnd: [sidebarWidth: number, listWidth: number]
  twoPanelResize: [listWidth: number]
}>()

const containerRef = ref<HTMLElement>()
const sidebarHandleRef = ref<HTMLElement>()
const listHandleRef = ref<HTMLElement>()

const internalSidebarWidth = ref(props.sidebarWidth)
const internalListWidth = ref(props.listWidth)

function clampWidth(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getMaxWidth(excludeWidth: number) {
  const total = containerRef.value?.clientWidth || window.innerWidth
  return total - excludeWidth - LAYOUT_DEFAULTS.editor.min
}

const { isResizing: isSidebarResizing } = useResizeHandle(sidebarHandleRef, {
  direction: 'horizontal',
  onMove(dx) {
    const max = getMaxWidth(props.showList ? internalListWidth.value : 0)
    internalSidebarWidth.value = clampWidth(
      internalSidebarWidth.value + dx,
      LAYOUT_DEFAULTS.sidebar.min,
      max,
    )
  },
  onEnd() {
    emit('resizeEnd', internalSidebarWidth.value, internalListWidth.value)
  },
})

const { isResizing: isListResizing } = useResizeHandle(listHandleRef, {
  direction: 'horizontal',
  onMove(dx) {
    const exclude = props.showSidebar ? internalSidebarWidth.value : 0
    const max = getMaxWidth(exclude)
    internalListWidth.value = clampWidth(
      internalListWidth.value + dx,
      LAYOUT_DEFAULTS.list.min,
      max,
    )
  },
  onEnd() {
    if (props.showSidebar) {
      emit('resizeEnd', internalSidebarWidth.value, internalListWidth.value)
    }
    else {
      emit('twoPanelResize', internalListWidth.value)
    }
  },
})

const isResizing = computed(
  () => isSidebarResizing.value || isListResizing.value,
)

// ── Three floating rounded cards ───────────────────────────────────────────
// Each column is its own rounded rectangle with a subtle border and inset
// highlight. The canvas tint shows through the gap between cards, and the
// resize handles live in that gap as invisible hit zones (copper pill shows
// on hover). Inner content uses h-full + flex so it adapts to the card's
// reduced height — no clipping.
const wrapperClass = 'h-screen flex gap-1.5 p-2 pl-0'
const cardBase
  = 'bg-card/70 border-border/60 overflow-hidden rounded-xl border shadow-[0_1px_0_0_oklch(100%_0_0_/_0.35)_inset,0_6px_22px_-14px_oklch(22%_0.018_55_/_0.14)]'
const sidebarCard = `${cardBase} shrink-0 bg-sidebar/75`
const listCard = `${cardBase} shrink-0 bg-card/60`
const editorCard = `${cardBase} min-w-0 flex-1`
const handleClass
  = 'before:bg-primary/0 hover:before:bg-primary/55 data-[resizing]:before:bg-primary relative z-10 flex w-1.5 shrink-0 cursor-col-resize items-center justify-center bg-transparent before:absolute before:top-1/2 before:left-1/2 before:h-10 before:w-[2px] before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:transition-[background-color,height] before:duration-200 before:content-[\'\'] after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2 after:content-[\'\'] hover:before:h-16 data-[resizing]:before:h-16'
</script>

<template>
  <div
    v-if="!showList && !showSidebar"
    :class="wrapperClass"
  >
    <div :class="editorCard">
      <slot name="editor" />
    </div>
  </div>
  <div
    v-else-if="!showList"
    ref="containerRef"
    :class="wrapperClass"
  >
    <div
      :style="{ width: `${internalSidebarWidth}px` }"
      :class="sidebarCard"
    >
      <div
        class="h-full"
        :style="{ '--header-gap': `${props.headerGap}px` }"
      >
        <slot name="sidebar" />
      </div>
    </div>
    <div
      ref="sidebarHandleRef"
      :class="handleClass"
    />
    <div :class="editorCard">
      <slot name="editor" />
    </div>
    <div
      v-if="isResizing"
      class="fixed inset-0 z-50 cursor-col-resize"
    />
  </div>
  <div
    v-else
    ref="containerRef"
    :class="wrapperClass"
  >
    <div
      v-if="showSidebar"
      :style="{ width: `${internalSidebarWidth}px` }"
      :class="sidebarCard"
    >
      <div
        class="h-full"
        :style="{ '--header-gap': `${props.headerGap}px` }"
      >
        <slot name="sidebar" />
      </div>
    </div>
    <div
      v-if="showSidebar"
      ref="sidebarHandleRef"
      :class="handleClass"
    />
    <div
      :style="{ width: `${internalListWidth}px` }"
      :class="listCard"
    >
      <slot name="list" />
    </div>
    <div
      ref="listHandleRef"
      :class="handleClass"
    />
    <div :class="editorCard">
      <slot name="editor" />
    </div>
    <div
      v-if="isResizing"
      class="fixed inset-0 z-50 cursor-col-resize"
    />
  </div>
</template>
