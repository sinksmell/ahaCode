<script setup lang="ts">
import { isMac } from '@/utils'

interface Props {
  showRail?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showRail: true,
})
</script>

<template>
  <div
    class="bg-canvas relative grid h-screen overflow-hidden"
    :class="props.showRail ? 'grid-cols-[68px_1fr]' : 'grid-cols-[1fr]'"
  >
    <!-- Atmospheric backdrop: warm paper with copper halo -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 z-0"
      style="
        background:
          radial-gradient(
            1100px 720px at 12% -15%,
            oklch(from var(--primary) l c h / 0.09) 0%,
            transparent 55%
          ),
          radial-gradient(
            900px 600px at 110% 110%,
            oklch(from var(--primary) l c h / 0.05) 0%,
            transparent 60%
          );
      "
    />

    <div
      v-if="props.showRail"
      class="relative z-10 bg-transparent"
      :class="isMac && 'mt-2.5'"
    >
      <SpaceRail />
    </div>
    <div class="relative z-10 min-h-0 min-w-0 overflow-hidden">
      <slot />
    </div>
  </div>
</template>
