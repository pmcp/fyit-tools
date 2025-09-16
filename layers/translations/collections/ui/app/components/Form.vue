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

      <!-- Team Mode: Select from overrideable system translations -->
      <UFormField
        v-if="mode === 'team' && !state?.id"
        :label="t('translations.ui.selectSystemTranslation')"
        name="systemTranslation"
      >
        <USelectMenu
          v-model="selectedSystemTranslation"
          :items="systemTranslations || []"
          :loading="loadingSystemTranslations"
          :placeholder="t('translations.ui.searchSystemTranslations')"
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

      <!-- System Mode: Direct KeyPath input -->
      <UFormField
        v-if="mode === 'system' || state?.id"
        :label="t('translations.ui.keyPath')"
        name="keyPath"
      >
        <UInput
          v-model="state.keyPath"
          class="w-full"
          size="xl"
          :disabled="mode === 'team' && !!state?.id"
        />
      </UFormField>

      <!-- Category: Hidden for team editing -->
      <UFormField
        v-if="mode === 'system' || !state?.id"
        :label="t('forms.category')"
        name="category"
      >
        <UInput v-model="state.category" class="w-full" size="xl" />
      </UFormField>

      <!-- Show system translation info for team mode -->
      <div v-if="mode === 'team' && state?.id && systemTranslationData" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 class="text-sm font-semibold mb-2">{{ t('translations.ui.systemTranslation') }}</h4>
        <div class="space-y-1 text-sm">
          <div><span class="font-medium">Category:</span> {{ systemTranslationData.category }}</div>
          <div v-if="systemTranslationData.description"><span class="font-medium">System Description:</span> {{ systemTranslationData.description }}</div>
        </div>
      </div>

      <!-- Translation values for different locales -->
      <UFormField
        :label="t('forms.translations', 'Translations')"
        name="values"
        :required="true"
        #default="{ error }"
      >
        <TranslationsInput
          v-model="state.values"
          :fields="['value']"
          :label="t('forms.translations', 'Translations')"
          :error="error"
        />
      </UFormField>

      <UFormField
        :label="mode === 'team' && state?.id ? 'Team Override Description' : 'Description'"
        name="description"
      >
        <UTextarea
          v-model="state.description"
          class="w-full"
          size="xl"
          :placeholder="mode === 'team' && state?.id ? 'Optional team-specific description' : ''"
        />
      </UFormField>

      <!-- Hide override switch for team mode -->
      <USwitch
        v-if="mode === 'system'"
        :label="t('translations.ui.canBeOverriddenByTeams')"
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
const { t } = useT()

interface Props extends TranslationsUiFormProps {
  mode?: 'system' | 'team'
}

const { send } = useCrud()
const toast = useToast()

const props = withDefaults(defineProps<Props>(), {
  mode: 'system'
})

const { defaultValue, schema, collection } = useTranslationsUi()

// Determine which endpoint to use based on mode
const route = useRoute()
const teamSlug = route.params.team as string | undefined

const endpoint = computed(() =>
  props.mode === 'team' && teamSlug
    ? `/api/teams/${teamSlug}/translations-ui/system`
    : `/api/super-admin/translations-ui`
)

// System translations search (non-blocking to avoid async setup issues)
const { data: systemTranslations, refresh } = useFetch(endpoint.value)
const selectedSystemTranslation = ref<any>(null)
const loadingSystemTranslations = ref(false)

// For team mode editing: fetch the system translation
const systemTranslationData = ref<any>(null)
const fetchSystemTranslation = async (keyPath: string) => {
  if (props.mode !== 'team' || !keyPath || !teamSlug) return

  try {
    const data = await $fetch(`/api/teams/${teamSlug}/translations-ui/system-by-keypath`, {
      query: { keyPath }
    })
    systemTranslationData.value = data
  } catch (error) {
    console.error('Failed to fetch system translation:', error)
  }
}


// Initialize form state with proper values (simplified pattern - no watch needed!)
const initialValues = props.action === 'update' && props.activeItem?.id
  ? { ...defaultValue, ...props.activeItem }
  : { ...defaultValue }

// Ensure values is always an object
if (!initialValues.values || typeof initialValues.values !== 'object') {
  initialValues.values = { en: '' }
}

// Ensure description is never null
if (initialValues.description === null || initialValues.description === undefined) {
  initialValues.description = ''
}

const state = ref<TranslationsUiFormData & { id?: string | null }>(initialValues)

// Watch for system translation selection (for team overrides - this is the only watcher we need)
watch(selectedSystemTranslation, (newTranslation) => {
  if (newTranslation && props.mode === 'team') {
    // Pre-populate form with system translation data - PRESERVE THE ID!
    state.value = {
      ...state.value,
      id: state.value.id, // Explicitly preserve the id
      keyPath: newTranslation.keyPath,
      category: newTranslation.category || '',
      description: newTranslation.description || '',
      values: newTranslation.values && typeof newTranslation.values === 'object'
        ? { ...newTranslation.values }
        : { en: '' }
    }
  }
})

// Fetch system translation data if needed (only for team mode editing)
if (props.mode === 'team' && state.value.id && state.value.keyPath) {
  fetchSystemTranslation(state.value.keyPath)
}
</script>
