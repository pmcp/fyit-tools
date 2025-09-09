<template>
  <!-- Desktop sidebar - always rendered but hidden on mobile via CSS -->
  <div class="hidden lg:flex relative w-64 flex-col items-stretch overflow-hidden border-r border-neutral-200 bg-neutral-100 p-2 dark:border-neutral-900 dark:bg-black">
    <slot />
  </div>
  
  <!-- Mobile slideover - always rendered but only visible when open -->
  <USlideover
    v-model:open="model"
    side="left"
    :ui="{ 
      content: 'max-w-[75%] sm:max-w-[50%]',
      wrapper: 'lg:hidden' 
    }"
  >
    <template #content>
      <div class="flex h-full flex-col p-2">
        <slot />
      </div>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
const model = defineModel<boolean>({ required: true })
</script>
