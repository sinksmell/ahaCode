<script setup lang="ts">
interface Props {
  title: string
  sectionTitle?: string
}

defineProps<Props>()
</script>

<template>
  <div>
    <div class="flex h-9 items-center justify-between pl-1 select-none">
      <div class="flex items-baseline gap-1.5 truncate">
        <span
          class="bg-primary/80 inline-block h-1.5 w-1.5 rounded-full shadow-[0_0_0_3px_var(--primary-soft)]"
          aria-hidden="true"
        />
        <span
          class="font-display text-foreground truncate text-[19px] leading-none tracking-[-0.015em]"
        >
          {{ title }}
        </span>
      </div>
      <div
        v-if="$slots.actions"
        class="flex items-center gap-1"
      >
        <slot name="actions" />
      </div>
    </div>
    <SidebarSectionHeader
      v-if="sectionTitle"
      :title="sectionTitle"
    >
      <template
        v-if="$slots.action"
        #action
      >
        <slot name="action" />
      </template>
    </SidebarSectionHeader>
  </div>
</template>
