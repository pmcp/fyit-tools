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

      <!-- Translation fields -->
      <CrudTranslationField
          v-model="state.translations"
          :fields="['name', 'description', 'remarkPrompt']"
          :default-values="{
          name: state.name,
          description: state.description,
          remarkPrompt: state.remarkPrompt
        }"
          @update:english="(data) => { state[data.field] = data.value }"
          label="Translations"
      />

      <UFormField label="EventId" name="eventId">
        <UInput v-model.number="state.eventId" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="CategoryId" name="categoryId">
        <UInput v-model.number="state.categoryId" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="LocationId" name="locationId">
        <UInput v-model.number="state.locationId" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Price" name="price">
        <UInput v-model.number="state.price" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="IsActive" name="isActive">
        <UCheckbox v-model="state.isActive" />
      </UFormField>

      <UFormField label="IsTemplate" name="isTemplate">
        <UCheckbox v-model="state.isTemplate" />
      </UFormField>

      <UFormField label="RequiresRemark" name="requiresRemark">
        <UCheckbox v-model="state.requiresRemark" />
      </UFormField>

      <UFormField label="SortOrder" name="sortOrder">
        <UInput v-model.number="state.sortOrder" type="number" class="w-full" size="xl" />
      </UFormField>



      <CrudButton
        :action="action"
        :collection="collection"
        :items="items"
        :loading="loading"
      />
    </UForm>
    <br>
  </div>
</template>

<script setup lang="ts">
import type { PosProductFormProps, PosProductFormData } from '../../types'
import { z } from 'zod'

const { send } = useCrud()

const props = defineProps<PosProductFormProps>()

const { defaultValue, schema } = usePosProducts()

// Create a reactive form state with proper typing
const state = reactive<PosProductFormData & { id?: string | null }>({
  id: null,
  eventId: 0,
  categoryId: 0,
  locationId: 0,
  name: '',
  description: '',
  price: 0,
  isActive: false,
  isTemplate: false,
  requiresRemark: false,
  remarkPrompt: '',
  sortOrder: 0,
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
