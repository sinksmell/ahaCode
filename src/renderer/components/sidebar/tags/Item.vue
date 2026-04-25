<script setup lang="ts">
import { useApp } from '@/composables'
import { onClickOutside } from '@vueuse/core'
import { Hash } from 'lucide-vue-next'

interface Props {
  id: number
  name: string
}

const props = defineProps<Props>()

const { highlightedTagId, state } = useApp()

const tagRef = useTemplateRef('tagRef')

const isFocused = ref(false)
const isSelected = computed(() => state.tagId === props.id)
const isHighlighted = computed(() => highlightedTagId.value === props.id)

function onClickItem() {
  highlightedTagId.value = undefined
  isFocused.value = true
}

onClickOutside(tagRef, () => {
  isFocused.value = false
})
</script>

<template>
  <div
    ref="tagRef"
    :data-selected="isSelected ? 'true' : undefined"
    :data-focused="isFocused ? 'true' : undefined"
    :data-highlighted="isHighlighted ? 'true' : undefined"
    class="group before:bg-primary data-[selected=true]:bg-accent/70 data-[focused=true]:bg-primary-soft! data-[focused=true]:text-foreground! data-[highlighted=true]:outline-primary relative flex h-7 items-center gap-2 rounded-md pr-2 pl-6 transition-[background-color,color] duration-150 ease-out select-none before:absolute before:top-1/2 before:left-0 before:h-0 before:w-[2px] before:-translate-y-1/2 before:rounded-r-full before:opacity-0 before:transition-all before:duration-200 before:content-[''] data-[focused=true]:before:h-5 data-[focused=true]:before:opacity-100 data-[highlighted=true]:bg-transparent! data-[highlighted=true]:outline-2 data-[highlighted=true]:-outline-offset-2 data-[selected=true]:before:h-4 data-[selected=true]:before:opacity-60"
    :class="{ 'hover:bg-accent-hover': !isSelected && !isFocused }"
    @click="onClickItem"
  >
    <Hash
      class="h-[13px] w-[13px] shrink-0 transition-colors"
      :class="
        isFocused || isSelected
          ? 'text-primary'
          : 'text-primary/55 group-hover:text-primary/80'
      "
      stroke-width="2"
    />
    <span class="truncate font-mono text-[12.5px] tracking-[-0.005em]">{{
      name
    }}</span>
  </div>
</template>
