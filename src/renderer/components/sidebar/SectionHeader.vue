<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>

<template>
  <div class="flex h-8 items-center justify-between py-1 pl-1 select-none">
    <span
      class="text-muted-foreground/80 font-display text-[12px] leading-none tracking-[0.02em] italic"
    >
      {{ title }}
    </span>
    <slot name="action" />
  </div>
</template>
