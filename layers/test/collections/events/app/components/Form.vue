<template>
  <div class="space-y-4">
    <UForm :state="form" :schema="schema" @submit="handleSubmit">
      <UFormField name="name" label="name" required>
        <UInput v-model="form.name" />
      </UFormField>

      <UFormField name="description" label="description">
        <UTextarea v-model="form.description" rows="4" />
      </UFormField>
      
      <div class="flex justify-between pt-4">
        <CrudButton
          v-if="action === 'update'"
          variant="destructive"
          :loading="loading === 'delete'"
          @click="handleDelete"
        >
          Delete
        </CrudButton>
        
        <CrudButton
          type="submit"
          variant="primary"
          :loading="loading === 'submit'"
        >
          {{ action === 'create' ? 'Create' : 'Update' }}
        </CrudButton>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { useEvents } from '../composables/useEvents'
import type { Event, EventFormData } from '../../types'

const crud = useCrud()
const config = useEvents()

const props = defineProps<{
  action: 'create' | 'update'
  item?: Event
}>()

const form = ref<EventFormData>(
  props.item ? { ...props.item } : { ...config.defaultValues }
)

const schema = config.schema
const loading = ref<'submit' | 'delete' | null>(null)

async function handleSubmit() {
  loading.value = 'submit'
  try {
    await crud.send(props.action, 'events', form.value, props.item?.id)
    crud.close()
  } catch (error) {
    console.error('Form submission error:', error)
  } finally {
    loading.value = null
  }
}

async function handleDelete() {
  if (!props.item?.id) return
  loading.value = 'delete'
  try {
    await crud.send('delete', 'events', {}, props.item.id)
    crud.close()
  } catch (error) {
    console.error('Delete error:', error)
  } finally {
    loading.value = null
  }
}
</script>