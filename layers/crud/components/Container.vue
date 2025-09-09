<!-- Container.vue -->
<template>
  <component
    :is="modalComponent"
    v-model:open="localOpen"
    v-bind="modalProps"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <TypoH2>
          <span class="capitalize">{{ action }}</span> {{ cat }}
        </TypoH2>
        <UButton
          icon="i-heroicons-x-mark"
          variant="ghost"
          color="gray"
          size="xs"
          @click.stop="close()"/>
      </div>
    </template>
    <template #body>
      <div v-if="localOpen && activeCollection" class="w-full h-full">
        <CrudLoading v-if="loading !== 'notLoading'" class="h-full w-full"/>
        <div v-else>
          <CrudDynamicFormLoader
            :key="`${activeCollection}-${action}-${activeItem?.id || 'new'}`"
            :collection="activeCollection"
            :loading="loading"
            :action="action"
            :items="items"
            :activeItem="activeItem"
          />
        </div>
      </div>
    </template>
  </component>
</template>

<script setup lang="ts">
import { USlideover, UModal } from '#components'
import type { Component, Ref, ComputedRef } from 'vue'

// Type collections
type CrudAction = 'create' | 'update' | 'delete' | null
type LoadingState = 'notLoading' | 'create_send' | 'update_send' | 'delete_send' | 'create_open' | 'update_open' | 'delete_open'
type ModalComponent = 'USlideover' | 'UModal'

interface ModalConfig {
  component: ModalComponent
  props: Record<string, any>
}

interface CrudItem {
  id?: string | number
  optimisticId?: string
  optimisticAction?: CrudAction
  [key: string]: any
}

interface CrudComposableReturn {
  showCrud: Ref<boolean>
  items: Ref<CrudItem[]>
  activeItem: Ref<CrudItem>
  activeCollection: Ref<string | null>
  close: () => void
  loading: Ref<LoadingState>
  action: Ref<CrudAction>
}

interface FormatCollectionsReturn {
  collectionWithCapitalSingular: (collection: string) => string
  collectionWithCapital: (collection: string) => string
}

interface ComposableWithModalConfig {
  modalConfig?: ModalConfig
  [key: string]: any
}

type ComposableFunction = () => ComposableWithModalConfig

// Use the typed composables
const { showCrud, items, activeItem, activeCollection, close, loading, action }: CrudComposableReturn = useCrud()
const { collectionWithCapitalSingular }: FormatCollectionsReturn = useFormatCollections()

// Local open state that mirrors showCrud
const localOpen = computed<boolean>({
  get: () => showCrud.value,
  set: (value: boolean) => {
    if (!value) {
      close()
    }
  }
})

const cat = computed<string>(() =>
  activeCollection.value
    ? collectionWithCapitalSingular(activeCollection.value)
    : ''
)

// Component map for modal types
const componentMap: Record<ModalComponent, Component> = {
  'USlideover': USlideover,
  'UModal': UModal
}

// Default modal configuration
const DEFAULT_MODAL_CONFIG: ModalConfig = {
  component: 'USlideover',
  props: {}
}

// Dynamic modal configuration
const modalConfig = ref<ModalConfig>({ ...DEFAULT_MODAL_CONFIG })

const modalComponent = computed<Component>(() => {
  return componentMap[modalConfig.value.component] || USlideover
})

const modalProps = computed<Record<string, any>>(() => {
  return modalConfig.value.props || {}
})

// Function to load modal configuration for a collection
const loadModalConfig = (collection: string | null): ModalConfig => {
  if (!collection) return DEFAULT_MODAL_CONFIG

  // Get the collection config from useCollections
  const collections = useCollections()
  const config = collections.getConfig(collection)

  // Use modal config from collection if defined, otherwise use default
  if (config?.modalConfig) {
    return config.modalConfig
  }

  return DEFAULT_MODAL_CONFIG
}

// Watch showCrud to set modal configuration
watch(showCrud, (newValue: boolean) => {
  if (newValue && activeCollection.value) {
    modalConfig.value = loadModalConfig(activeCollection.value)
  } else {
    modalConfig.value = { ...DEFAULT_MODAL_CONFIG }
  }
})

// Clean up on unmount to prevent stale state issues
onBeforeUnmount(() => {
  if (showCrud.value) {
    close()
  }
  // Reset all state
  modalConfig.value = { ...DEFAULT_MODAL_CONFIG }
})
</script>
