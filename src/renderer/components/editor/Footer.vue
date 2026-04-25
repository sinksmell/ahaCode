<script setup lang="ts">
import { Button } from '@/components/ui/shadcn/button'
import * as Command from '@/components/ui/shadcn/command'
import * as Popover from '@/components/ui/shadcn/popover'
import { useApp, useEditor, useSnippets } from '@/composables'
import { i18n } from '@/electron'
import { Check } from 'lucide-vue-next'
import { languages } from './grammars/languages'

const { isShowCodeImage, isShowJsonVisualizer } = useApp()
const isShowTags = computed(
  () => !isShowCodeImage.value && !isShowJsonVisualizer.value,
)

const { cursorPosition } = useEditor()
const { selectedSnippetContent, selectedSnippet, updateSnippetContent }
  = useSnippets()

const isOpen = ref(false)
const languageListRef = ref<HTMLElement>()

function onSelect(value: string) {
  isOpen.value = false
  updateSnippetContent(
    selectedSnippet.value!.id,
    selectedSnippetContent.value!.id,
    {
      label: selectedSnippetContent.value!.label,
      value: selectedSnippetContent.value!.value,
      language: value,
    },
  )
}

const selectedLanguageName = computed(() => {
  return languages.find(
    language => language.value === selectedSnippetContent.value?.language,
  )?.name
})

function fuzzySearch(list: string[], searchTerm: string) {
  return list.filter((value) => {
    const language = languages.find(l => l.value === value)
    const name = language?.name || value
    const searchChars = searchTerm.toLowerCase().split('')
    let currentIndex = 0

    return searchChars.every((char) => {
      const index = name.toLowerCase().indexOf(char, currentIndex)
      if (index === -1)
        return false
      currentIndex = index + 1
      return true
    })
  })
}

function scrollToSelectedLanguage() {
  const selectedLanguage = selectedSnippetContent.value?.language

  if (!languageListRef.value || !selectedLanguage)
    return

  const selectedItem = Array.from(
    languageListRef.value.querySelectorAll<HTMLElement>('[data-language-item]'),
  ).find(item => item.dataset.languageItem === selectedLanguage)

  selectedItem?.scrollIntoView({ block: 'center' })
}

watch(isOpen, async (open) => {
  if (!open)
    return

  await nextTick()
  requestAnimationFrame(scrollToSelectedLanguage)
})
</script>

<template>
  <div
    data-editor-footer
    class="border-border/70 bg-card/30 flex items-center gap-2 border-t px-2 py-1 text-xs"
  >
    <div class="shrink-0">
      <Popover.Popover v-model:open="isOpen">
        <Popover.PopoverTrigger as-child>
          <Button
            variant="ghost"
            class="group border-primary/20 bg-primary-soft text-primary/90 hover:bg-primary/15 hover:border-primary/35 hover:text-primary -ml-1 h-6 gap-1.5 rounded-full border px-2.5 py-0 text-[11px] font-medium tracking-[-0.003em]"
            :class="
              !selectedLanguageName
                && 'border-border/60! text-muted-foreground! bg-transparent!'
            "
          >
            <span
              v-if="selectedLanguageName"
              class="bg-primary/75 inline-block h-1.5 w-1.5 rounded-full transition-transform group-hover:scale-110"
              aria-hidden="true"
            />
            <span class="font-mono">{{
              selectedLanguageName || i18n.t("placeholder.selectLanguage")
            }}</span>
          </Button>
        </Popover.PopoverTrigger>
        <Popover.PopoverContent class="w-auto px-1 py-0">
          <Command.Command
            :filter-function="fuzzySearch as any"
            :model-value="selectedSnippetContent?.language"
          >
            <Command.CommandInput
              class="h-9"
              placeholder="Select Language Mode"
            />
            <Command.CommandEmpty>No language found</Command.CommandEmpty>
            <Command.CommandList>
              <Command.CommandGroup>
                <div
                  ref="languageListRef"
                  class="scrollbar max-h-[150px] overflow-y-auto"
                >
                  <Command.CommandItem
                    v-for="language in languages"
                    :key="language.value"
                    :data-language-item="language.value"
                    class="hover:bg-accent-hover transition-colors"
                    :value="language.value"
                    @select="onSelect(language.value)"
                  >
                    {{ language.name }}
                    <Check
                      class="ml-auto h-4 w-4"
                      :class="
                        selectedSnippetContent?.language === language.value
                          ? 'opacity-100'
                          : 'opacity-0'
                      "
                    />
                  </Command.CommandItem>
                </div>
              </Command.CommandGroup>
            </Command.CommandList>
          </Command.Command>
        </Popover.PopoverContent>
      </Popover.Popover>
    </div>
    <!--
      Inline tag editor — lives in the footer next to the language pill so
      it shares real estate with other metadata, instead of stealing a full
      row at the top of the editor card. Hidden in image/JSON visualizer
      modes where tags don't apply.
    -->
    <div
      v-if="isShowTags"
      class="footer-tags min-w-0 flex-1"
    >
      <EditorTags />
    </div>
    <div
      v-else
      class="flex-1"
    />
    <div
      class="text-muted-foreground/80 mr-1 flex shrink-0 items-center gap-2 font-mono text-[11px] tabular-nums"
    >
      <span class="text-muted-foreground/50">Ln</span>
      <span class="text-foreground/75">{{ cursorPosition.row + 1 }}</span>
      <span class="text-border">·</span>
      <span class="text-muted-foreground/50">Col</span>
      <span class="text-foreground/75">{{ cursorPosition.column + 1 }}</span>
    </div>
  </div>
</template>
