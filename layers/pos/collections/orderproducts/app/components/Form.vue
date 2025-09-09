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
      <UFormField label="OrderId" name="orderId">
        <UInput v-model.number="state.orderId" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="ProductId" name="productId">
        <UInput v-model.number="state.productId" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Quantity" name="quantity">
        <UInput v-model.number="state.quantity" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="UnitPrice" name="unitPrice">
        <UInput v-model.number="state.unitPrice" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="TaxRate" name="taxRate">
        <UInput v-model.number="state.taxRate" type="number" class="w-full" size="xl" />
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

      <UFormField label="TotalPrice" name="totalPrice">
        <UInput v-model.number="state.totalPrice" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Remarks" name="remarks">
        <UTextarea v-model="state.remarks" class="w-full" size="xl" />
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
import type { PosOrderProductFormProps, PosOrderProductFormData } from '../../types'
import { z } from 'zod'

const { send } = useCrud()

const props = defineProps<PosOrderProductFormProps>()

const { defaultValue, schema } = usePosOrderProducts()

// Create a reactive form state with proper typing
const state = reactive<PosOrderProductFormData & { id?: string | null }>({
  id: null,
  orderId: 0,
  productId: 0,
  quantity: 0,
  unitPrice: 0,
  taxRate: 0,
  discountAmount: 0,
  totalAmount: 0,
  notes: '',
  totalPrice: 0,
  remarks: ''
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