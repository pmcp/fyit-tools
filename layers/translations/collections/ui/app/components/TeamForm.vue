<template>
  <UForm :state="state" :schema="schema" @submit="handleSubmit" class="space-y-4">
    <!-- Search system translations -->
    <UFormField :label="tString('forms.baseFromSystemTranslation')" name="systemTranslation" v-if="!item?.id">

      <USelectMenu
        v-model="selectedSystemTranslation"
        :items="systemTranslations"
        :loading="loadingSystemTranslations"
:placeholder="tString('forms.searchSystemTranslations')"
        :search-input="{
          placeholder: tString('forms.searchByKeyCategoryDescription'),
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
        <template #item-label="{ item }">
          <div class="w-full">
            <div class="font-medium">{{ item.keyPath }}</div>
            <div class="text-xs text-muted">
              <span v-if="item.category">{{ item.category }} • </span>
              <span v-if="item.description">{{ item.description }}</span>
            </div>
          </div>
        </template>

        <template #label>
          <span v-if="selectedSystemTranslation">
            {{ selectedSystemTranslation.keyPath }}
          </span>
        </template>
      </USelectMenu>
    </UFormField>

    <UFormField :label="tString('forms.keyPath')" name="keyPath" required>
      <UInput
        v-model="state.keyPath"
:placeholder="tString('forms.keyPathPlaceholder')"
        :disabled="!!item?.id"
      />
    </UFormField>

    <UFormField :label="tString('forms.category')" name="category" required>
      <UInput
        v-model="state.category"
        :placeholder="tString('forms.categoryPlaceholder')"
      />
    </UFormField>

    <UFormField :label="tString('forms.description')" name="description">
      <UTextarea
        v-model="state.description"
        :placeholder="tString('forms.descriptionPlaceholder')"
        rows="3"
      />
    </UFormField>

    <div class="space-y-3">
      <label class="block text-sm font-medium">
        {{ tString('forms.translations') }} <span class="text-red-500">*</span>
      </label>

      <UCard v-for="locale in availableLocales" :key="locale" class="p-4">
        <UFormField :label="getLocaleLabel(locale)" :name="`values.${locale}`">
          <TranslationsInputWithEditor
            v-model="state.values[locale]"
            :placeholder="tString('forms.enterTranslationFor', { params: { locale: getLocaleLabel(locale) } })"
            :use-editor="false"
          />
        </UFormField>
      </UCard>
    </div>

    <!-- Action buttons -->
    <div class="flex items-center justify-end gap-3 pt-4">
      <UButton
        type="button"
        variant="ghost"
        @click="$emit('cancel')"
        :disabled="loading"
      >
        {{ tString('common.cancel') }}
      </UButton>
      <UButton
        type="submit"
        :loading="loading"
      >
        {{ item?.id ? tString('common.update') : tString('common.create') }}
      </UButton>
    </div>
  </UForm>
</template>

<script setup lang="ts">
import { z } from 'zod'

interface TranslationItem {
  id?: string
  keyPath: string
  category?: string
  values?: Record<string, string>
  description?: string | null
  label?: string
}

interface Props {
  item?: TranslationItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  saved: [item: TranslationItem]
  cancel: []
}>()

const route = useRoute()
const toast = useToast()
const { locales } = useI18n()
const { tString } = useT()

// Get team slug from route
const teamSlug = computed(() => route.params.team as string)

// Available locales
const availableLocales = computed(() =>
  locales.value.map((l: string | { code: string }) => typeof l === 'string' ? l : l.code)
)

// Form schema
const schema = z.object({
  keyPath: z.string().min(1, 'Key path is required'),
  category: z.string().min(1, 'Category is required'),
  values: z.record(z.string()).refine(
    (values) => Object.keys(values).some(key => values[key]?.trim()),
    { message: 'At least one translation is required' }
  ),
  description: z.string().optional(),
})

// Form state
const loading = ref(false)
const state = ref({
  keyPath: props.item?.keyPath || '',
  category: props.item?.category || '',
  values: props.item?.values || {},
  description: props.item?.description || '',
})

// System translations search
const selectedSystemTranslation = ref<TranslationItem | null>(null)
const systemTranslations = ref<TranslationItem[]>([])
const loadingSystemTranslations = ref(false)

// Initialize empty values for all locales
watchEffect(() => {
  availableLocales.value.forEach((locale: string) => {
    if (!state.value.values[locale]) {
      state.value.values[locale] = ''
    }
  })
})

// Fetch system translations when component mounts
onMounted(async () => {
  if (!props.item?.id) {
    loadingSystemTranslations.value = true
    try {
      const data = await $fetch<TranslationItem[]>(`/api/teams/${teamSlug.value}/translations-ui/system`)
      systemTranslations.value = data.map((t: TranslationItem) => ({
        ...t,
        label: t.keyPath // Required for SelectMenu filtering
      }))
    } catch (error) {
      console.error('Failed to fetch system translations:', error)
      toast.add({
        title: tString('common.error'),
        description: tString('errors.failedToLoadSystemTranslations'),
        color: 'red',
        icon: 'i-lucide-circle-x',
      })
    } finally {
      loadingSystemTranslations.value = false
    }
  }
})

// Watch for selection changes and populate form
watch(selectedSystemTranslation, (newTranslation: TranslationItem | null) => {
  if (newTranslation && !props.item?.id) {
    // Only populate if not editing an existing translation
    state.value.keyPath = newTranslation.keyPath
    state.value.category = newTranslation.category || ''
    state.value.description = newTranslation.description || ''

    // Copy translation values
    if (newTranslation.values) {
      Object.keys(newTranslation.values).forEach((locale: string) => {
        if (state.value.values[locale] !== undefined) {
          state.value.values[locale] = newTranslation.values[locale]
        }
      })
    }

    toast.add({
      title: tString('messages.translationLoaded'),
      description: tString('messages.populatedFormWithSystemTranslation', { params: { keyPath: newTranslation.keyPath } }),
      color: 'green',
      icon: 'i-lucide-circle-check',
    })
  }
})

// Handle form submission
async function handleSubmit() {
  loading.value = true
  try {
    const endpoint = props.item?.id
      ? `/api/teams/${teamSlug.value}/translations-ui/${props.item.id}`
      : `/api/teams/${teamSlug.value}/translations-ui`

    const method = props.item?.id ? 'PATCH' : 'POST'

    const response = await $fetch<TranslationItem>(endpoint, {
      method,
      body: state.value,
    })

    toast.add({
      title: props.item?.id ? tString('common.updated') : tString('common.created'),
      description: props.item?.id
        ? tString('messages.translationUpdated', { params: { keyPath: state.value.keyPath } })
        : tString('messages.translationCreated', { params: { keyPath: state.value.keyPath } }),
      color: 'green',
      icon: 'i-lucide-circle-check',
    })

    emit('saved', response)
  } catch (error: any) {
    console.error('Failed to save translation:', error)
    toast.add({
      title: tString('common.error'),
      description: error.data?.message || tString('errors.failedToSaveTranslation'),
      color: 'red',
      icon: 'i-lucide-circle-x',
    })
  } finally {
    loading.value = false
  }
}

// Helper to get locale label
function getLocaleLabel(locale: string): string {
  const labels: Record<string, string> = {
    en: 'English',
    nl: 'Nederlands',
    fr: 'Français'
  }
  return labels[locale] || locale.toUpperCase()
}
</script>