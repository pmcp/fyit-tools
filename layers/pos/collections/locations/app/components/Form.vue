<template>
  <div v-if="loading === 'notLoading'">
    <!-- DELETE BUTTON-->
    <CrudButton
      v-if="action === 'delete'"
      :action="action"
      :collection="collection"
      :items="items"
      :loading="loading"
    />

    <!-- FORM FOR EDIT OR CREATE -->
    <UForm
      v-else
      :schema="schema"
      :state="state"
      class="space-y-4 flex flex-col justify-between h-full gap-4"
      @submit="send(action, collection, state)"
      size="lg"
    >
      <UFormField label="EventId" name="eventId">
        <UInput v-model.number="state.eventId" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Name" name="name">
        <UInput v-model="state.name" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Description" name="description">
        <UTextarea v-model="state.description" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="IsActive" name="isActive">
        <UCheckbox v-model="state.isActive" />
      </UFormField>

      <UFormField label="PrinterMode" name="printerMode">
        <UInput v-model="state.printerMode" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="MaxRetryAttempts" name="maxRetryAttempts">
        <UInput v-model.number="state.maxRetryAttempts" type="number" class="w-full" size="xl" />
      </UFormField>

      <CrudButton
        :action="action"
        :collection="collection"
        :items="items"
        :loading="loading"
      />
    </UForm>
  </div>
</template>

<script setup lang="ts">
import type { PosLocationFormProps, PosLocationFormData } from '../../types'
import { z } from 'zod'

const { send } = useCrud()

const props = defineProps<PosLocationFormProps>()

const { defaultValue, schema } = usePosLocations()

// Create a reactive form state with proper typing
const state = reactive<PosLocationFormData & { id?: string | null }>({
  id: null,
  eventId: 0,
  name: '',
  description: '',
  isActive: false,
  printerMode: '',
  maxRetryAttempts: 0
})

// Compute what the initial values should be based on props
const getInitialValues = () => {
  if (props.action === 'update' && 'id' in props.activeItem && props.activeItem.id) {
    // Update mode: use activeItem data
    return {
      ...props.activeItem
    }
  } else if (props.action === 'create') {
    // Create mode: use defaults
    return {
      ...defaultValue
    }
  } else {
    // Fallback to empty object
    return {}
  }
}

// Initialize and watch for prop changes
watchEffect(() => {
  const initialValues = getInitialValues()
  // Merge the values into the reactive state
  Object.assign(state, initialValues)
})
</script>