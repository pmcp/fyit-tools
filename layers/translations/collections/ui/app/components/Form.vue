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
      <UFormField label="KeyPath" name="keyPath">
        <UInput v-model="state.keyPath" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Category" name="category">
        <UInput v-model="state.category" class="w-full" size="xl" />
      </UFormField>

      <!-- Translation values for different locales -->
      <CrudTranslationField
        v-model="translationValues"
        :fields="['value']"
        :default-values="{ value: englishValue }"
        @update:english="(data) => { englishValue = data.value; updateValues() }"
        label="Translations"
      />

      <UFormField label="Description" name="description">
        <UTextarea v-model="state.description" class="w-full" size="xl" />
      </UFormField>

      <USwitch label="Can be overridden by teams" v-model="state.isOverrideable" size="lg" />

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
import type { TranslationsUiFormProps, TranslationsUiFormData } from '../../types'
import { z } from 'zod'

const { send } = useCrud()

const props = defineProps<TranslationsUiFormProps>()

const { defaultValue, schema } = useTranslationsUi()

// Separate state for handling the translation field component
const englishValue = ref('')
const translationValues = ref<Record<string, any>>({})

// Create a reactive form state with proper typing
const state = reactive<TranslationsUiFormData & { id?: string | null }>({
  id: null,
  keyPath: '',
  category: '',
  values: '',
  description: '',
  isOverrideable: true
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

// Helper to update the state.values from the translation component data
function updateValues() {
  const values: Record<string, string> = {
    en: englishValue.value
  }

  // Add other locale values
  for (const [locale, data] of Object.entries(translationValues.value)) {
    if (data && typeof data === 'object' && 'value' in data) {
      values[locale] = data.value
    }
  }

  state.values = values
}

// Watch the translation values and update state.values
watch([englishValue, translationValues], () => {
  updateValues()
}, { deep: true })

// Initialize and watch for prop changes
watchEffect(() => {
  const initialValues = getInitialValues()
  // Merge the values into the reactive state
  Object.assign(state, initialValues)

  // If we have existing values, parse them for the translation component
  if (initialValues.values && typeof initialValues.values === 'object') {
    // Extract English value
    englishValue.value = initialValues.values.en || ''

    // Extract other locale values in the format expected by CrudTranslationField
    const otherLocales: Record<string, any> = {}
    for (const [locale, value] of Object.entries(initialValues.values)) {
      if (locale !== 'en') {
        otherLocales[locale] = { value }
      }
    }
    translationValues.value = otherLocales
  }
})
</script>
