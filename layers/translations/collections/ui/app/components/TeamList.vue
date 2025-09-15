<template>
  <div class="space-y-6">
    <CrudTable
      :collection="'translationsUi'"
      :columns="columns"
      :rows="teamTranslations"
    >
      <template #header>
        <CrudTableHeader
          title="Team Translation Overrides"
          :collection="'translationsUi'"
          createButton
        />
      </template>

      <template #values-cell="{ row }">
        <div class="text-sm">
          <CrudTranslationDisplay :translations="row.values" />
        </div>
      </template>

      <template #isOverrideable-cell="{ row }">
        <UBadge
          v-if="row.isOverrideable !== undefined"
          :color="row.isOverrideable ? 'primary' : 'gray'"
          variant="soft"
        >
          {{ row.isOverrideable ? 'Yes' : 'No' }}
        </UBadge>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex items-center gap-2">
          <UButton
            @click="editTranslation(row)"
            icon="i-lucide-pencil"
            size="xs"
            variant="soft"
          />
          <UButton
            @click="deleteTranslationConfirm(row)"
            icon="i-lucide-trash"
            size="xs"
            variant="soft"
            color="red"
          />
        </div>
      </template>
    </CrudTable>

  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

const route = useRoute()
const toast = useToast()

// Team ID from route
const teamId = computed(() => route.params.team as string)

// Translation schema
const translationSchema = z.object({
  keyPath: z.string().min(1, 'Key path is required'),
  category: z.string().min(1, 'Category is required'),
  values: z.record(z.string()),
  description: z.string().optional(),
})

// State
const loading = ref(false)
const saving = ref(false)
const teamTranslations = ref<any[]>([])
const showEditModal = ref(false)
const editingTranslation = ref<any>(null)
const formState = ref({
  keyPath: '',
  category: '',
  values: {},
  description: '',
})

// Languages from i18n config
const { locales } = useI18n()
const languages = computed(() => locales.value.map(l => typeof l === 'string' ? l : l.code))

// Table columns
const columns = [
  { accessorKey: 'keyPath', header: 'Key Path' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'values', header: 'Values' },
  { accessorKey: 'isOverrideable', header: 'Overrideable' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'actions', header: 'Actions' },
]

// Fetch team translations
async function fetchTranslations() {
  loading.value = true
  try {
    const data = await $fetch(`/api/teams/${teamId.value}/translations-ui`)
    teamTranslations.value = data
  } catch (error) {
    console.error('Failed to fetch translations:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to load translations',
      color: 'red',
      icon: 'i-lucide-circle-x'
    })
  } finally {
    loading.value = false
  }
}

// Edit translation
function editTranslation(translation: any) {
  editingTranslation.value = translation
  formState.value = {
    keyPath: translation.keyPath,
    category: translation.category || '',
    values: { ...translation.values },
    description: translation.description || '',
  }

  // Initialize empty values for missing languages
  languages.value.forEach(lang => {
    if (!formState.value.values[lang]) {
      formState.value.values[lang] = ''
    }
  })

  showEditModal.value = true
}


// Initialize
onMounted(() => {
  fetchTranslations()
})

// Watch for team changes
watch(() => teamId.value, () => {
  if (teamId.value) {
    fetchTranslations()
  }
})
</script>
