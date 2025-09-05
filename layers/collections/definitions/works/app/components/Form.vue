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
import { useWorks } from '../composables/useWorks'
import type { Work, WorkFormData } from '../../types'

const crud = useCrud()
const config = useWorks()

const props = defineProps<{
  action: 'create' | 'update'
  item?: Work
}>()

const form = ref<WorkFormData>(
  props.item ? { ...props.item } : { ...config.defaultValues }
)

const schema = config.schema
const loading = ref<'submit' | 'delete' | null>(null)

async function handleSubmit() {
  loading.value = 'submit'
  try {
    await crud.send(props.action, 'works', form.value, props.item?.id)
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
    await crud.send('delete', 'works', {}, props.item.id)
    crud.close()
  } catch (error) {
    console.error('Delete error:', error)
  } finally {
    loading.value = null
  }
}
</script>