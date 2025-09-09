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
      <UFormField label="LogType" name="logType">
        <UInput v-model="state.logType" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Message" name="message">
        <UTextarea v-model="state.message" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Metadata" name="metadata">
        <UInput v-model="state.metadata" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="EventId" name="eventId">
        <UInput v-model.number="state.eventId" type="number" class="w-full" size="xl" />
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
import type { PosSystemLogFormProps, PosSystemLogFormData } from '../../types'
import { z } from 'zod'

const { send } = useCrud()

const props = defineProps<PosSystemLogFormProps>()

const { defaultValue, schema } = usePosSystemLogs()

// Create a reactive form state with proper typing
const state = reactive<PosSystemLogFormData & { id?: string | null }>({
  id: null,
  logType: '',
  message: '',
  metadata: '',
  eventId: 0
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