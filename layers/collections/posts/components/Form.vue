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

// Create a reactive form item
const state = ref({})

const selectedFile = ref<File | null>(null)

// Compute what the initial values should be based on props
const getInitialValues = () => {
  if (props.action === 'update' && props.items[0]) {
    // Update mode: prepare the item data
    return {
      ...props.items[0]
    }
  } else {
    // Create mode: use defaults with first location if available
    return {
      ...defaultValue
    }
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
  state.value = getInitialValues()
})



// Handle form submission - convert moment to number for API
const handleSubmit = () => {
  send(props.action, props.collection, submitData);
};

</script>
