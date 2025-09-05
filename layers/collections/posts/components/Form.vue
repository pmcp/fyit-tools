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
const { send } = useCrud()

const props = defineProps({
  items: {
    type: Array,
    default: []
  },
  activeItem: {
    type: Object,
    default: () => ({})
  },
  collection: {
    type: String,
    default: ''
  },
  loading: {
    type: String,
    default: ''
  },
  action: {
    type: String,
    default: ''
  }
})

const { defaultValue, schema } = usePosts()

// Create a reactive form state
const state = reactive({
  id: null,
  title: '',
  content: '',
  image: null
})

const selectedFile = ref<File | null>(null)

// Compute what the initial values should be based on props
const getInitialValues = () => {
  console.log('Getting initial values - action:', props.action, 'activeItem:', props.activeItem)
  
  if (props.action === 'update' && props.activeItem && props.activeItem.id) {
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
  console.log('State after assignment:', state)
})



// Handle form submission - convert moment to number for API
const handleSubmit = () => {
  send(props.action, props.collection, submitData);
};

</script>
