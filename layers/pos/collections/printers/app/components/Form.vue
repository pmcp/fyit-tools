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

      <UFormField label="IpAddress" name="ipAddress">
        <UInput v-model="state.ipAddress" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Port" name="port">
        <UInput v-model.number="state.port" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Status" name="status">
        <UInput v-model.number="state.status" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="ShowPrices" name="showPrices">
        <UCheckbox v-model="state.showPrices" />
      </UFormField>

      <UFormField label="LocationId" name="locationId">
        <UInput v-model.number="state.locationId" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Priority" name="priority">
        <UInput v-model.number="state.priority" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="HealthStatus" name="healthStatus">
        <UInput v-model="state.healthStatus" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="LastSuccessAt" name="lastSuccessAt">
        <UInput v-model="state.lastSuccessAt" type="datetime-local" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="LastFailureAt" name="lastFailureAt">
        <UInput v-model="state.lastFailureAt" type="datetime-local" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="ConsecutiveFailures" name="consecutiveFailures">
        <UInput v-model.number="state.consecutiveFailures" type="number" class="w-full" size="xl" />
      </UFormField>

      <!-- Translation fields -->
      <CrudTranslationField
        v-model="state.translations"
        :fields="['name', 'statusMessage']"
        :default-values="{
          name: state.name
        }"
        label="Translations"
        @update:english="(data) => { state[data.field] = data.value }"
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
import type { PosPrinterFormProps, PosPrinterFormData } from '../../types'
import { z } from 'zod'

const { send } = useCrud()

const props = defineProps<PosPrinterFormProps>()

const { defaultValue, schema } = usePosPrinters()

// Create a reactive form state with proper typing
const state = reactive<PosPrinterFormData & { id?: string | null }>({
  id: null,
  eventId: 0,
  name: '',
  ipAddress: '',
  port: 0,
  status: 0,
  showPrices: false,
  locationId: 0,
  priority: 0,
  healthStatus: '',
  lastSuccessAt: null,
  lastFailureAt: null,
  consecutiveFailures: 0,
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