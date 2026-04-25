<script setup lang="ts">
interface Props {
  selected?: boolean
  focused?: boolean
  hoverable?: boolean
}

withDefaults(defineProps<Props>(), {
  selected: false,
  focused: false,
  hoverable: true,
})
</script>

<template>
  <div
    data-sidebar-item
    :data-selected="selected ? 'true' : undefined"
    :data-focused="focused ? 'true' : undefined"
    class="before:bg-primary data-[selected=true]:bg-accent/70 data-[focused=true]:bg-primary-soft! data-[focused=true]:text-foreground! relative rounded-md transition-[background-color,color] duration-150 ease-out before:absolute before:top-1/2 before:left-0 before:h-0 before:w-[2px] before:-translate-y-1/2 before:rounded-r-full before:opacity-0 before:transition-all before:duration-200 before:content-[''] data-[focused=true]:before:h-5 data-[focused=true]:before:opacity-100 data-[selected=true]:before:h-4 data-[selected=true]:before:opacity-60"
    :class="{
      'hover:bg-accent-hover': hoverable && !selected && !focused,
    }"
  >
    <slot />
  </div>
</template>
