<template>
  <div v-if="loading === 'notLoading'">
    <!-- DELETE BUTTON-->
    <CrudButton
      v-if="action === 'delete'"
      :action="action"
      :collection="collection"
      @click="deleteItems"
    />

    <!-- FORM -->
    <UForm
      v-else
      :state="state"
      :schema="schema"
      @submit="onSubmit"
      class="w-full"
    >
      <div class="space-y-6 mb-6">
      <UFormField label="Id" name="id">
        <UInput v-model="state.id" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Name" name="name">
        <UInput v-model="state.name" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Price" name="price">
        <UInput v-model.number="state.price" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="InStock" name="inStock">
        <UCheckbox v-model="state.inStock" />
      </UFormField>
      </div>

      <!-- SUBMIT BUTTON -->
      <CrudButton :action="action" :collection="collection" />
    </UForm>
  </div>

  <!-- LOADING -->
  <CrudLoading v-else />
</template>

<script setup lang="ts">
import { itemSchema } from '../composables/useItems'
import type { Item } from '../types'

const props = defineProps<{
  action: 'create' | 'update' | 'delete'
  collection: string
  activeItem?: Item
}>()

const crud = useCrud()
const loading = computed(() => crud.loading.value)
const schema = itemSchema

// Initialize form state
const state = reactive({
  id: '',
  name: '',
  price: 0,
  inStock: false
})

// If updating, populate the form with existing data
if (props.action === 'update' && props.activeItem) {
  Object.assign(state, props.activeItem)
}

async function onSubmit() {
  await crud.send(props.action, props.collection, state)
}

async function deleteItems() {
  if (props.activeItem?.id) {
    await crud.send('delete', props.collection, [props.activeItem.id])
  }
}
</script>