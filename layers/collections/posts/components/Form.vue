<template>
  {{ collection }}
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
      <UFormField label="Image" name="imagePath">
        <AppPostImageUploader
          v-model="state.image"
          @file-selected="handleFileSelected"
        />
      </UFormField>
      <UFormField label="Title" name="title">
        <UInput v-model="state.title" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Content" name="content">
        <UTextarea v-model="state.content" class="w-full" size="xl" />
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
import type { PostFormProps, PostFormData } from '../types'
import { z } from 'zod'

const { send } = useCrud()

const props = defineProps<PostFormProps>()

const { defaultValue, schema } = usePosts()

// Create a reactive form state with proper typing
const state = reactive<PostFormData & { id?: string | null }>({
  id: null,
  title: '',
  content: '',
  image: undefined
})

const selectedFile = ref<File | null>(null)

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


const handleFileSelected = (file: File | null) => {
  selectedFile.value = file
  if (!file) {
    state.image = undefined
  }
}

// Initialize and watch for prop changes
watchEffect(() => {
  const initialValues = getInitialValues()
  // Merge the values into the reactive state
  Object.assign(state, initialValues)
})



</script>
