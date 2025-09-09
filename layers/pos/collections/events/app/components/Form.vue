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
      <UFormField label="Slug" name="slug">
        <UInput v-model="state.slug" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="EventType" name="eventType">
        <UInput v-model="state.eventType" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Status" name="status">
        <UInput v-model="state.status" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="StartDate" name="startDate">
        <UInput v-model="state.startDate" type="datetime-local" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="EndDate" name="endDate">
        <UInput v-model="state.endDate" type="datetime-local" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="IsActive" name="isActive">
        <UCheckbox v-model="state.isActive" />
      </UFormField>

      <UFormField label="IsCurrent" name="isCurrent">
        <UCheckbox v-model="state.isCurrent" />
      </UFormField>

      <UFormField label="ArchivedAt" name="archivedAt">
        <UInput v-model="state.archivedAt" type="datetime-local" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="ParentEventId" name="parentEventId">
        <UInput v-model.number="state.parentEventId" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Metadata" name="metadata">
        <UInput v-model="state.metadata" class="w-full" size="xl" />
      </UFormField>

      <!-- Translation fields -->
      <CrudTranslationField
        v-model="state.translations"
        :fields="['name', 'description', 'terms', 'conditions']"
        :default-values="{
          name: state.name,
          description: state.description
        }"
        label="Translations"
      />

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
import type { PosEventFormProps, PosEventFormData } from '../../types'
import { z } from 'zod'

const { send } = useCrud()

const props = defineProps<PosEventFormProps>()

const { defaultValue, schema } = usePosEvents()

// Create a reactive form state with proper typing
const state = reactive<PosEventFormData & { id?: string | null }>({
  id: null,
  name: '',
  slug: '',
  description: '',
  eventType: '',
  status: '',
  startDate: null,
  endDate: null,
  isActive: false,
  isCurrent: false,
  archivedAt: null,
  parentEventId: 0,
  metadata: '',
  translations: {}
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