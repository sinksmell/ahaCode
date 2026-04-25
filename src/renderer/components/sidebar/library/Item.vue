<script setup lang="ts">
import type { SnippetsQuery } from '~/renderer/services/api/generated'
import { useApp, useFolders, useSnippets } from '@/composables'
import { LibraryFilter } from '@/composables/types'
import { onClickOutside } from '@vueuse/core'

const props = defineProps<Props>()

interface Props {
  id: (typeof LibraryFilter)[keyof typeof LibraryFilter]
  name: string
  icon: Component
}

const { state } = useApp()
const { clearFolderSelection } = useFolders()

const { getSnippets, selectFirstSnippet, clearSearch, isRestoreStateBlocked }
  = useSnippets()

const isFocused = ref(false)
const itemRef = ref<HTMLElement>()
const isSelected = computed(() => state.libraryFilter === props.id)

async function onItemClick(
  id: (typeof LibraryFilter)[keyof typeof LibraryFilter],
) {
  isFocused.value = true
  isRestoreStateBlocked.value = true
  clearSearch()

  state.libraryFilter = id
  clearFolderSelection()
  state.tagId = undefined

  const query: SnippetsQuery = {}

  if (id === LibraryFilter.Favorites) {
    query.isFavorites = 1
  }
  else if (id === LibraryFilter.Trash) {
    query.isDeleted = 1
  }
  else if (id === LibraryFilter.All) {
    query.isDeleted = 0
  }
  else if (id === LibraryFilter.Inbox) {
    query.isInbox = 1
  }

  await getSnippets(query)
  selectFirstSnippet()
}

onClickOutside(itemRef, () => {
  isFocused.value = false
})
</script>

<template>
  <div
    ref="itemRef"
    data-sidebar-item
    :data-selected="isSelected ? 'true' : undefined"
    :data-focused="isFocused ? 'true' : undefined"
    class="group before:bg-primary data-[selected=true]:bg-accent/70 data-[focused=true]:bg-primary-soft! data-[focused=true]:text-foreground! relative rounded-md transition-[background-color,color] duration-150 ease-out before:absolute before:top-1/2 before:left-0 before:h-0 before:w-[2px] before:-translate-y-1/2 before:rounded-r-full before:opacity-0 before:transition-all before:duration-200 before:content-[''] data-[focused=true]:before:h-5 data-[focused=true]:before:opacity-100 data-[selected=true]:before:h-4 data-[selected=true]:before:opacity-60"
    :class="{ 'hover:bg-accent-hover': !isSelected && !isFocused }"
    @click="onItemClick(id)"
  >
    <div class="ml-5 flex h-7 items-center gap-2 pr-2">
      <component
        :is="icon"
        class="h-[15px] w-[15px] shrink-0 transition-colors"
        :class="
          isFocused
            ? 'text-primary'
            : isSelected
              ? 'text-foreground/80'
              : 'text-muted-foreground/90 group-hover:text-foreground/80'
        "
        stroke-width="1.6"
      />
      <div class="tracking-[-0.005em] select-none">
        {{ name }}
      </div>
    </div>
  </div>
</template>
