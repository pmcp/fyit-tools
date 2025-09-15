<template>
  <UForm :state="state" :schema="schema" @submit="handleSubmit" class="space-y-4">
    <!-- Search system translations -->
    <UFormField label="Base from System Translation" name="systemTranslation" v-if="!item?.id">

      <USelectMenu
        v-model="selectedSystemTranslation"
        :items="systemTranslations"
        :loading="loadingSystemTranslations"
        placeholder="Search system translations..."
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

    <UFormField label="Key Path" name="keyPath" required>
      <UInput
        v-model="state.keyPath"
        placeholder="e.g., common.welcome, navigation.home"
        :disabled="!!item?.id"
      />
    </UFormField>

    <UFormField label="Category" name="category" required>
      <UInput
        v-model="state.category"
        placeholder="e.g., common, navigation, forms"
      />
    </UFormField>

    <UFormField label="Description" name="description">
      <UTextarea
        v-model="state.description"
        placeholder="Optional description for this translation"
        :rows="2"
      />
    </UFormField>

    <div class="space-y-2">
      <label class="text-sm font-medium">Translations</label>
      <div class="space-y-2">
        <div v-for="locale in availableLocales" :key="locale" class="flex items-center gap-2">
          <UBadge :label="locale.toUpperCase()" variant="soft" class="w-12 justify-center" />
          <UInput
            v-model="state.values[locale]"
            :placeholder="`Translation for ${locale}`"
            class="flex-1"
          />
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-2">
      <UButton
        type="button"
        variant="ghost"
        color="gray"
        @click="emit('cancel')"
      >
        Cancel
      </UButton>
      <UButton
        type="submit"
        :loading="loading"
        color="primary"
      >
        {{ item?.id ? 'Update' : 'Create' }} Translation
      </UButton>
    </div>
  </UForm>
</template>

<script setup lang="ts">
import { z } from 'zod'

const props = defineProps<{
  item?: any
  collection: string
}>()

const emit = defineEmits<{
  cancel: []
  success: [data: any]
}>()

const route = useRoute()
const toast = useToast()
const { locales } = useI18n()

// Get team slug from route
const teamSlug = computed(() => route.params.team as string)

// Available locales
const availableLocales = computed(() =>
  locales.value.map(l => typeof l === 'string' ? l : l.code)
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
const selectedSystemTranslation = ref(null)
const systemTranslations = ref([])
const loadingSystemTranslations = ref(false)

// Initialize empty values for all locales
watchEffect(() => {
  availableLocales.value.forEach(locale => {
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
      const data = await $fetch(`/api/teams/${teamSlug.value}/translations-ui/system`)
      systemTranslations.value = data.map(t => ({
        ...t,
        label: t.keyPath // Required for SelectMenu filtering
      }))
    } catch (error) {
      console.error('Failed to fetch system translations:', error)
      toast.add({
        title: 'Error',
        description: 'Failed to load system translations',
        color: 'red',
        icon: 'i-lucide-circle-x',
      })
    } finally {
      loadingSystemTranslations.value = false
    }
  }
})

// Watch for selection changes and populate form
watch(selectedSystemTranslation, (newTranslation) => {
  if (newTranslation && !props.item?.id) {
    // Only populate if not editing an existing translation
    state.value.keyPath = newTranslation.keyPath
    state.value.category = newTranslation.category || ''
    state.value.description = newTranslation.description || ''

    // Copy translation values
    if (newTranslation.values) {
      Object.keys(newTranslation.values).forEach(locale => {
        if (state.value.values[locale] !== undefined) {
          state.value.values[locale] = newTranslation.values[locale]
        }
      })
    }

    toast.add({
      title: 'Translation loaded',
      description: `Populated form with system translation: ${newTranslation.keyPath}`,
      color: 'green',
      icon: 'i-lucide-circle-check',
    })
  }
})

// Handle form submission
async function handleSubmit() {
  loading.value = true

  try {
    // Remove empty values
    const cleanedValues = Object.fromEntries(
      Object.entries(state.value.values).filter(([_, v]) => v && v.trim())
    )

    const payload = {
      ...state.value,
      values: cleanedValues,
    }

    const isUpdate = !!props.item?.id
    const url = isUpdate
      ? `/api/teams/${teamSlug.value}/translations-ui/${props.item.id}`
      : `/api/teams/${teamSlug.value}/translations-ui`

    const result = await $fetch(url, {
      method: isUpdate ? 'PATCH' : 'POST',
      body: payload,
    })

    toast.add({
      title: 'Success',
      description: `Translation ${isUpdate ? 'updated' : 'created'} successfully`,
      color: 'green',
      icon: 'i-lucide-circle-check',
    })

    emit('success', result)
  } catch (error: any) {
    console.error('Failed to save translation:', error)
    toast.add({
      title: 'Error',
      description: error.data?.statusMessage || 'Failed to save translation',
      color: 'red',
      icon: 'i-lucide-circle-x',
    })
  } finally {
    loading.value = false
  }
}
</script>
