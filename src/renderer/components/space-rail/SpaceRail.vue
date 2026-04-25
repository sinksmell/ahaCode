<script setup lang="ts">
import * as Tooltip from '@/components/ui/shadcn/tooltip'
import { i18n, store } from '@/electron'
import { RouterName } from '@/router'
import { getSpaceDefinitions } from '@/spaceDefinitions'
import { isMac } from '@/utils'
import { Settings } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import packageJson from '../../../../package.json'

const route = useRoute()

const spaces = computed(() => {
  return getSpaceDefinitions().map(space => ({
    ...space,
    active: space.isActive(route.name),
  }))
})

watch(
  () => spaces.value.find(s => s.active)?.id,
  (spaceId) => {
    if (spaceId) {
      store.app.set('activeSpaceId', spaceId)
    }
  },
)
</script>

<template>
  <nav
    class="flex h-full flex-col items-center px-2 pb-3"
    :class="isMac ? 'pt-[calc(var(--content-top-offset)+8px)]' : 'pt-3'"
    :aria-label="i18n.t('spaces.label')"
  >
    <div class="flex w-full flex-col gap-1">
      <RouterLink
        v-for="space in spaces"
        :key="space.id"
        v-slot="{ navigate }"
        custom
        :to="space.to"
      >
        <Tooltip.Tooltip>
          <Tooltip.TooltipTrigger as-child>
            <button
              type="button"
              class="group text-muted-foreground/85 relative flex w-full cursor-default flex-col items-center gap-1 rounded-[10px] border border-transparent px-2 py-2.5 transition-all duration-200 ease-out"
              :class="
                space.active
                  ? 'bg-background/80 text-foreground border-border/60 shadow-[0_1px_0_0_rgb(255_255_255/0.4)_inset,0_1px_2px_0_rgb(0_0_0/0.04)]'
                  : 'hover:bg-accent-hover/60 hover:text-foreground/85'
              "
              @click="navigate"
            >
              <span
                v-if="space.active"
                aria-hidden="true"
                class="bg-primary absolute top-1/2 -left-2 h-5 w-[2px] -translate-y-1/2 rounded-r-full shadow-[0_0_0_3px_var(--primary-soft)]"
              />
              <component
                :is="space.icon"
                class="h-4 w-4 shrink-0 transition-colors"
                :class="space.active ? 'text-primary' : ''"
                stroke-width="1.7"
              />
              <span
                class="font-display text-[11px] leading-none tracking-tight select-none"
                :class="
                  space.active
                    ? 'text-foreground italic'
                    : 'text-muted-foreground/85'
                "
              >
                {{ space.label }}
              </span>
            </button>
          </Tooltip.TooltipTrigger>
          <Tooltip.TooltipContent side="right">
            {{ space.tooltip }}
          </Tooltip.TooltipContent>
        </Tooltip.Tooltip>
      </RouterLink>
    </div>
    <div
      class="mt-auto flex flex-1 flex-col items-center justify-end gap-2.5 pb-1"
    >
      <RouterLink
        v-slot="{ navigate }"
        custom
        :to="{ name: RouterName.preferences }"
      >
        <UiActionButton
          :tooltip="i18n.t('preferences:label')"
          class="hover:text-primary"
          @click="navigate"
        >
          <Settings
            class="h-4 w-4"
            stroke-width="1.6"
          />
        </UiActionButton>
      </RouterLink>
      <span
        class="text-muted-foreground/50 font-mono text-[9px] leading-none tracking-[0.08em] uppercase select-none"
      >
        v{{ packageJson.version }}
      </span>
    </div>
  </nav>
</template>
