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

      <!-- Team Context: Select from overrideable system translations -->
      <UFormField 
        v-if="isTeamContext && !state?.id" 
        label="Select System Translation to Override" 
        name="systemTranslation"
      >
        <USelectMenu
          v-model="selectedSystemTranslation"
          :items="systemTranslations || []"
          :loading="loadingSystemTranslations"
          placeholder="Search system translations to override..."
          :search-input="{
            placeholder: 'Search by key, category or description...',
            icon: 'i-lucide-search'
          }"
          :filter-fields="['keyPath', 'category', 'description']"
          value-key="id"
          class="w-full"
          :ui="{
            item: 'flex flex-col items-start',
            itemLabel: 'w-full'
          }"
        >
          <template #item="{ item }">
            <div class="w-full">
              <div class="font-medium">{{ item.keyPath }}</div>
              <div class="text-xs text-gray-500">{{ item.category }}</div>
            </div>
          </template>
        </USelectMenu>
      </UFormField>

      <!-- Super Admin Context: Direct KeyPath input -->
      <UFormField 
        v-if="!isTeamContext || state?.id" 
        label="KeyPath" 
        name="keyPath"
      >
        <UInput 
          v-model="state.keyPath" 
          class="w-full" 
          size="xl" 
          :disabled="isTeamContext && !!state?.id"
        />
      </UFormField>

      <!-- Category: Hidden for team editing -->
      <UFormField 
        v-if="!isTeamContext || !state?.id"
        label="Category" 
        name="category"
      >
        <UInput v-model="state.category" class="w-full" size="xl" />
      </UFormField>
      
      <!-- Show system translation info for team context -->
      <div v-if="isTeamContext && state?.id && systemTranslationData" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 class="text-sm font-semibold mb-2">System Translation</h4>
        <div class="space-y-1 text-sm">
          <div><span class="font-medium">Category:</span> {{ systemTranslationData.category }}</div>
          <div v-if="systemTranslationData.description"><span class="font-medium">System Description:</span> {{ systemTranslationData.description }}</div>
        </div>
      </div>

      <!-- Translation values for different locales -->
      <CrudTranslationField
        v-model="translationValues"
        :fields="['value']"
        :default-values="{ value: englishValue }"
        @update:english="(data) => { englishValue = data.value; updateValues() }"
        label="Translations"
      />

      <UFormField 
        :label="isTeamContext && state?.id ? 'Team Override Description' : 'Description'" 
        name="description"
      >
        <UTextarea 
          v-model="state.description" 
          class="w-full" 
          size="xl"
          :placeholder="isTeamContext && state?.id ? 'Optional team-specific description' : ''"
        />
      </UFormField>

      <!-- Hide override switch for team context -->
      <USwitch 
        v-if="!isTeamContext"
        label="Can be overridden by teams" 
        v-model="state.isOverrideable" 
        size="lg" 
      />

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


const { send } = useCrud()

const props = defineProps<TranslationsUiFormProps>()

const { defaultValue, schema } = useTranslationsUi()

// Determine which endpoint to use based on context
const route = useRoute()
const teamSlug = route.params.team as string | undefined
const isTeamContext = computed(() => !!teamSlug)

const endpoint = computed(() => 
  teamSlug 
    ? `/api/teams/${teamSlug}/translations-ui/system`
    : `/api/super-admin/translations-ui`
)

// System translations search
const { data: systemTranslations, refresh } = await useFetch(endpoint.value)
const selectedSystemTranslation = ref<any>(null)
const loadingSystemTranslations = ref(false)

// For team context editing: fetch the system translation
const systemTranslationData = ref<any>(null)
const fetchSystemTranslation = async (keyPath: string) => {
  if (!isTeamContext.value || !keyPath || !teamSlug) return
  
  try {
    const data = await $fetch(`/api/teams/${teamSlug}/translations-ui/system-by-keypath`, {
      query: { keyPath }
    })
    systemTranslationData.value = data
  } catch (error) {
    console.error('Failed to fetch system translation:', error)
  }
}


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

// Watch for system translation selection (for team overrides)
watch(selectedSystemTranslation, (newTranslation) => {
  if (newTranslation && isTeamContext.value) {
    // Pre-populate form with system translation data
    state.keyPath = newTranslation.keyPath
    state.category = newTranslation.category || ''
    state.description = newTranslation.description || ''
    
    // Pre-populate translation values
    if (newTranslation.values && typeof newTranslation.values === 'object') {
      // Extract English value
      englishValue.value = newTranslation.values.en || ''
      
      // Extract other locale values
      const otherLocales: Record<string, any> = {}
      for (const [locale, value] of Object.entries(newTranslation.values)) {
        if (locale !== 'en') {
          otherLocales[locale] = { value }
        }
      }
      translationValues.value = otherLocales
    }
  }
})

// Initialize and watch for prop changes
watchEffect(async () => {
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
  
  // Fetch system translation data for team context
  if (isTeamContext.value && state.id && state.keyPath) {
    await fetchSystemTranslation(state.keyPath)
  }
})
</script>
