<template>
  <div v-if="loading === 'notLoading'">
    <!-- CUSTOM DELETE CONFIRMATION FOR TRANSLATION OVERRIDES -->
    <div
      v-if="action === 'delete'"
      class="space-y-6 p-6"
    >
      <div class="text-center space-y-4">
        <!-- Warning Icon -->
        <div class="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <UIcon name="i-lucide-alert-triangle" class="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>

        <!-- Title -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Remove Translation Override?
          </h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span class="max-w-prose mx-auto">
            This will permanently delete your team's custom translation and revert to using the system translation.
            </span>
          </p>
        </div>

        <!-- System Translation Preview -->
        <div v-if="systemPreviewData" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-left">
          <h4 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Will revert to system translation:
          </h4>
          <div class="space-y-1">
            <div class="text-xs text-blue-700 dark:text-blue-300 font-mono">
              {{ systemPreviewData.keyPath }}
            </div>
            <div class="text-sm text-blue-800 dark:text-blue-200">
              <TranslationsDisplay :translations="systemPreviewData.values" />
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 w-full justify-center">
        <UButton
          color="neutral"
          variant="soft"
          @click="close()"
        >
          Cancel
        </UButton>
        <UButton
          color="error"
          :loading="loading !== 'notLoading'"
          :disabled="loading !== 'notLoading'"
          @click="send(action, collection, items)"
          icon="i-lucide-trash-2"
        >
          Remove Override
        </UButton>
      </div>
    </div>

    <!-- FORM FOR EDIT OR CREATE -->
    <UForm
      v-else
      :schema="schema"
      :state="state"
      class="space-y-4 flex flex-col justify-between h-full gap-4"
      @submit="send(action, collection, state)"
      size="lg"
    >

      <!-- Team Mode: Select from overrideable system translations (only if no pre-populated data) -->
      <UFormField
        v-if="mode === 'team' && !state?.id && !state?.keyPath"
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
        v-if="mode === 'system'"
        :label="t('translations.ui.keyPath')"
        name="keyPath"
      >
        <UInput
          v-model="state.keyPath"
          class="w-full"
          size="xl"
        />
      </UFormField>

      <!-- Team Mode: Show keyPath as read-only when pre-populated or editing -->
      <div v-if="mode === 'team' && (state?.id || state?.keyPath)" class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('translations.ui.keyPath') }}</label>
        <div class="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md text-sm font-mono">
          {{ state.keyPath }}
        </div>
      </div>

      <!-- Category: Show input for system mode or when creating from scratch -->
      <UFormField
        v-if="mode === 'system' || (!state?.id && !state?.keyPath)"
        :label="t('forms.category')"
        name="category"
      >
        <UInput v-model="state.category" class="w-full" size="xl" />
      </UFormField>

      <!-- Category: Show as read-only info for pre-populated team overrides -->
      <div v-if="mode === 'team' && state?.keyPath && state?.category && !state?.id" class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
        <div class="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
          {{ state.category }}
        </div>
      </div>

      <!-- Show system translation info for team mode -->
      <div v-if="mode === 'team' && state?.id && systemTranslationData" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 class="text-sm font-semibold mb-2">{{ t('translations.ui.systemTranslation') }}</h4>
        <div class="space-y-1 text-sm">
          <div><span class="font-medium">Category:</span> {{ systemTranslationData.category }}</div>
          <div v-if="systemTranslationData.description"><span class="font-medium">System Description:</span> {{ systemTranslationData.description }}</div>
        </div>
      </div>

      <!-- Rich Text Toggle -->
      <USwitch
        v-model="useRichTextEditor"
        :label="t('translations.ui.useRichTextEditor', 'Use Rich Text Editor')"
        size="lg"
      />

      <!-- Translation values for different locales -->
      <UFormField
        :label="t('forms.translations', 'Translations')"
        name="values"
        :required="true"
        #default="{ error }"
      >
        <TranslationsInputWithEditor
          v-model="state.values"
          :fields="['value']"
          :label="t('forms.translations', 'Translations')"
          :error="error"
          :use-rich-text="useRichTextEditor"
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

const { send, close } = useCrud()
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
const initialValues = (props.action === 'update' && props.activeItem?.id) || (props.action === 'create' && props.activeItem && Object.keys(props.activeItem).length > 0)
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

// Toggle for rich text editor
const useRichTextEditor = ref(false)

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

// For delete actions, fetch system translation preview to show what user will revert to
const systemPreviewData = ref(null)
const fetchSystemPreview = async () => {
  if (props.action !== 'delete' || props.mode !== 'team' || !props.items?.length) return

  try {
    // First get the override data to get the keyPath
    const overrideId = props.items[0]
    const overrideData = await $fetch(`/api/teams/${teamSlug}/translations-ui/${overrideId}`)

    if (overrideData?.keyPath) {
      // Then fetch the system translation
      const systemData = await $fetch(`/api/teams/${teamSlug}/translations-ui/system-by-keypath`, {
        query: { keyPath: overrideData.keyPath }
      })
      systemPreviewData.value = systemData
    }
  } catch (error) {
    console.error('Failed to fetch system translation preview:', error)
  }
}

// Fetch system preview when component is mounted for delete action
if (props.action === 'delete') {
  fetchSystemPreview()
}
</script>
