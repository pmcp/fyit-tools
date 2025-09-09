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

      <UFormField label="ClientId" name="clientId">
        <UInput v-model.number="state.clientId" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="LocationId" name="locationId">
        <UInput v-model.number="state.locationId" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="OrderNumber" name="orderNumber">
        <UInput v-model="state.orderNumber" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Status" name="status">
        <UInput v-model="state.status" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="PaymentMethod" name="paymentMethod">
        <UInput v-model="state.paymentMethod" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="PaymentStatus" name="paymentStatus">
        <UInput v-model="state.paymentStatus" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Subtotal" name="subtotal">
        <UInput v-model.number="state.subtotal" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="TaxAmount" name="taxAmount">
        <UInput v-model.number="state.taxAmount" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="DiscountAmount" name="discountAmount">
        <UInput v-model.number="state.discountAmount" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="TotalAmount" name="totalAmount">
        <UInput v-model.number="state.totalAmount" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Notes" name="notes">
        <UTextarea v-model="state.notes" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Metadata" name="metadata">
        <UInput v-model="state.metadata" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="CompletedAt" name="completedAt">
        <UInput v-model="state.completedAt" type="datetime-local" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="EventOrderNumber" name="eventOrderNumber">
        <UInput v-model.number="state.eventOrderNumber" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="ClientName" name="clientName">
        <UInput v-model="state.clientName" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="WaiterId" name="waiterId">
        <UInput v-model.number="state.waiterId" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Personnel" name="personnel">
        <UCheckbox v-model="state.personnel" />
      </UFormField>

      <UFormField label="OverallRemarks" name="overallRemarks">
        <UTextarea v-model="state.overallRemarks" class="w-full" size="xl" />
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
import type { PosOrderFormProps, PosOrderFormData } from '../../types'
import { z } from 'zod'

const { send } = useCrud()

const props = defineProps<PosOrderFormProps>()

const { defaultValue, schema } = usePosOrders()

// Create a reactive form state with proper typing
const state = reactive<PosOrderFormData & { id?: string | null }>({
  id: null,
  eventId: 0,
  clientId: 0,
  locationId: 0,
  orderNumber: '',
  status: '',
  paymentMethod: '',
  paymentStatus: '',
  subtotal: 0,
  taxAmount: 0,
  discountAmount: 0,
  totalAmount: 0,
  notes: '',
  metadata: '',
  completedAt: null,
  eventOrderNumber: 0,
  clientName: '',
  waiterId: 0,
  personnel: false,
  overallRemarks: ''
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