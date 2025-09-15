<template>
  <div class="space-y-6">
    {{ t('navigation.teamTranslations') }}
    <CrudTable
      collection="translationsUi"
      :columns="enhancedColumns"
      :rows="enhancedTranslations"
      :server-pagination="true"
      :pagination-data="pagination"
      :refresh-fn="refresh"
      :hide-default-columns="{
        created_at: true,
        updated_at: true,
        actions: false
      }"
    >
      <template #header>
        <CrudTableHeader
          title="Team Translation Overrides"
          :collection="'translationsUi'"
        />
      </template>

      <template #systemValues-cell="{ row }">
        <div class="text-sm">
          <TranslationsDisplay :translations="row.original.systemValues" />
        </div>
      </template>

      <template #teamValues-cell="{ row }">
        <div v-if="row.original.hasOverride" class="text-sm">
          <TranslationsDisplay :translations="row.original.teamValues" />
        </div>
        <div v-else class="text-gray-500 italic text-sm">
          (using system)
        </div>
      </template>

      <template #isOverrideable-cell="{ row }">
        <UBadge
          v-if="row.original.isOverrideable !== undefined"
          :color="row.original.isOverrideable ? 'primary' : 'gray'"
          variant="soft"
        >
          {{ row.original.isOverrideable ? 'Yes' : 'No' }}
        </UBadge>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex items-center gap-2">
          <UButton
            @click="editTranslation(row.original)"
            icon="i-lucide-pencil"
            size="xs"
            variant="soft"
            :color="row.original.hasOverride ? 'orange' : 'primary'"
          >
            {{ row.original.hasOverride ? 'Edit' : 'Override' }}
          </UButton>
        </div>
      </template>
    </CrudTable>

  </div>
</template>

<script setup lang="ts">
const { t } = useT()
const { columns } = useTranslationsUi()
const { open, crudStates } = useCrud()

// Enhanced columns for the new table view
const enhancedColumns = [
  { accessorKey: 'keyPath', header: 'KeyPath' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'systemValues', header: 'System Values' },
  { accessorKey: 'teamValues', header: 'Your Override' },
]

// Custom data fetching for the with-system endpoint
const enhancedTranslations = ref([])
const loading = ref(false)
const error = ref(null)

// Simple pagination state
const pagination = ref({
  currentPage: 1,
  pageSize: 50,
  total: 0
})

// Fetch function
const refresh = async () => {
  loading.value = true
  error.value = null
  try {
    const route = useRoute()
    const teamSlug = route.params.id || route.params.team

    if (!teamSlug) {
      throw new Error('Team slug not found in route parameters')
    }

    const data = await $fetch(`/api/teams/${teamSlug}/translations-ui/with-system`)
    enhancedTranslations.value = data || []
    pagination.value.total = enhancedTranslations.value.length
  } catch (e) {
    error.value = e
    console.error('Failed to fetch translations:', e)
  } finally {
    loading.value = false
  }
}

// Auto-fetch on mount
onMounted(() => refresh())

// Smart edit function that handles both creating overrides and editing existing ones
const editTranslation = async (translation: any) => {
  if (translation.hasOverride) {
    // Edit existing team override
    open('update', 'translationsUi', [translation.overrideId])
  } else {
    // Create new team override - pre-fill with system data
    open('create', 'translationsUi', [])

    // Pre-fill the form data after opening
    await nextTick()
    const currentState = crudStates.value[crudStates.value.length - 1]
    if (currentState) {
      currentState.activeItem = {
        keyPath: translation.keyPath,
        category: translation.category,
        values: { ...translation.systemValues }, // Start with system values
        description: '', // Team can add custom description
        isOverrideable: translation.isOverrideable
      }
    }
  }
}

// Watch for CRUD operations completing and refresh the list
watch(
  () => crudStates.value.length,
  (newLength, oldLength) => {
    // If a CRUD state was removed (operation completed), refresh the list
    if (newLength < oldLength) {
      refresh()
    }
  }
)
</script>
