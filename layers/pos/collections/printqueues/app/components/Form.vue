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
      @submit="send(action, collection, state.value)"
      size="lg"
    >
      <UFormField label="OrderId" name="orderId">
        <UInput v-model.number="state.orderId" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="LocationId" name="locationId">
        <UInput v-model.number="state.locationId" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="PrinterId" name="printerId">
        <UInput v-model.number="state.printerId" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Status" name="status">
        <UInput v-model="state.status" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Items" name="items">
        <UInput v-model="state.items" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Total" name="total">
        <UInput v-model.number="state.total" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="PrintMode" name="printMode">
        <UInput v-model="state.printMode" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="IsDuplicateOf" name="isDuplicateOf">
        <UInput v-model.number="state.isDuplicateOf" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="StartedAt" name="startedAt">
        <UInput v-model="state.startedAt" type="datetime-local" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="CompletedAt" name="completedAt">
        <UInput v-model="state.completedAt" type="datetime-local" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="ErrorMessage" name="errorMessage">
        <UTextarea v-model="state.errorMessage" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="RetryCount" name="retryCount">
        <UInput v-model.number="state.retryCount" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="EventId" name="eventId">
        <UInput v-model.number="state.eventId" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="PrintData" name="printData">
        <UTextarea v-model="state.printData" class="w-full" size="xl" />
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
import type { PosPrintQueueFormProps, PosPrintQueueFormData } from '../../types'

const { send } = useCrud()

const props = defineProps<PosPrintQueueFormProps>()

const { defaultValue, schema, collection } = usePosPrintQueues()

// Create a reactive form state with proper typing

// Initialize form state with proper values (no watch needed!)
const initialValues = props.action === 'update' && props.activeItem?.id
  ? { ...defaultValue, ...props.activeItem }
  : { ...defaultValue }

const state = ref<PosPrintQueueFormData & { id?: string | null }>(initialValues)
</script>