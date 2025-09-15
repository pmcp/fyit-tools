<!-- Container.vue -->
<template>
  <!-- Render a slideover for each crud state -->
  <USlideover
    v-for="(state, index) in crudStates"
    :key="state.id"
    v-model:open="state.isOpen"
    :side="'right'"
    :style="{
      zIndex: 40 + (index * 10),
      top: `${index * 40}px`,
      height: `calc(100vh - ${index * 40}px)`
    }"
    :class="`crud-slideover-level-${index}`"
    @update:open="(val) => handleSlideoverClose(state.id, val)"
    @after:leave="() => handleAfterLeave(state.id)"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2">
          <span v-if="index > 0" class="text-md">
            {{ state.action}} {{ getCollectionName(crudStates[index-1].collection)}} >
          </span>
          <TypoH2>
            <span class="capitalize">{{ state.action }}</span>
            {{ getCollectionName(state.collection) }}
          </TypoH2>
        </div>
        <UButton
          icon="i-lucide-x"
          variant="ghost"
          color="gray"
          size="xs"
          @click.stop="close(state.id)"
        />
      </div>
    </template>
    <template #body>
      <div v-if="state.isOpen && state.collection" class="w-full h-full">
         <CrudLoading v-if="state.loading !== 'notLoading'" class="h-full w-full"/>
        <div v-else>
          <CrudDynamicFormLoader
            :key="`${state.collection}-${state.action}-${state.activeItem?.id || 'new'}-${state.id}`"
            :collection="state.collection"
            :loading="state.loading"
            :action="state.action"
            :items="state.items"
            :activeItem="state.activeItem"
          />
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { USlideover } from '#components'
import type { Ref } from 'vue'

// Type definitions
type CrudAction = 'create' | 'update' | 'delete' | null
type LoadingState = 'notLoading' | 'create_send' | 'update_send' | 'delete_send' | 'create_open' | 'update_open' | 'delete_open'

interface CrudState {
  id: string
  action: CrudAction
  collection: string | null
  activeItem: any
  items: any[]
  loading: LoadingState
  isOpen: boolean
}

interface CrudComposableReturn {
  crudStates: Ref<CrudState[]>
  close: (stateId?: string) => void
  closeAll: () => void
  removeState: (stateId: string) => void
}

interface FormatCollectionsReturn {
  collectionWithCapitalSingular: (collection: string) => string
}

// Use the composables
const { crudStates, close, closeAll, removeState }: CrudComposableReturn = useCrud()
const { collectionWithCapitalSingular }: FormatCollectionsReturn = useFormatCollections()

// Get formatted collection name
const getCollectionName = (collection: string | null): string => {
  return collection ? collectionWithCapitalSingular(collection) : ''
}

// Handle slideover close event - just update the open state
const handleSlideoverClose = (stateId: string, isOpen: boolean): void => {
  if (!isOpen) {
    // Find the state and set isOpen to false to trigger animation
    const state = crudStates.value.find(s => s.id === stateId)
    if (state) {
      state.isOpen = false
    }
  }
}

// Handle after leave animation complete - actually remove the state
const handleAfterLeave = (stateId: string): void => {
  removeState(stateId)
}

// Clean up on unmount
onBeforeUnmount(() => {
  closeAll()
})
</script>

<style scoped>
/* Optional: Add custom styles for different levels */
.crud-slideover-level-0 {
  /* First level styling */
}

.crud-slideover-level-1 {
  /* Second level styling */
}

.crud-slideover-level-2 {
  /* Third level styling */
}

.crud-slideover-level-3 {
  /* Fourth level styling */
}

.crud-slideover-level-4 {
  /* Fifth level styling */
}
</style>
