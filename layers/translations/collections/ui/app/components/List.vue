<template>
  <div class="space-y-6">
    <CrudTable
      collection="translationsUi"
      :columns="columns"
      :rows="translationsItems"
      :server-pagination="true"
      :pagination-data="pagination"
      :refresh-fn="refresh"
    >
      <template #header>
          <CrudTableHeader
            :title="t('translations.ui.systemTranslations')"
            :collection="'translationsUi'"
            createButton
          >
            <template #extraButtons>
              <UModal>
                <UButton
                  :loading="importingFromLocales"
                  variant="soft"
                  color="blue"
                >
                  {{ t('translations.ui.importFromLocaleFiles') }}

                </UButton>
                <template #content>
                  <div class="flex flex-col gap-4">
                    <UButton
                      @click="importFromLocales('replace')"
                      :disabled="importingFromLocales"
                    >

                      Replace All (Clear & Import)
                    </UButton>
                    <UButton
                      @click="importFromLocales('merge')"
                      :disabled="importingFromLocales"
                    >
                      <UIcon name="i-lucide-git-merge" class="mr-2" />
                      Merge (Update & Add)
                    </UButton>

                    <UButton
                      @click="syncTranslations"
                      :loading="syncing"
                      variant="soft"
                    >
                      {{ t('translations.ui.syncToLocaleFiles') }}
                    </UButton>



                    <UModal>
                      <UButton
                        variant="soft"
                      >
                        {{ t('translations.ui.import') }}
                      </UButton>
                      <template #header>
                        <div class="flex items-center justify-between">
                          <h3 class="text-lg font-semibold">{{ t('translations.ui.bulkImportTranslations') }}</h3>

                        </div>
                      </template>
                      <template #content>
                        <UCard>
                          <div class="space-y-4">
                            <UButton
                              @click="showExample = !showExample"
                              variant="ghost"
                              size="sm"
                              :icon="showExample ? 'i-lucide-eye-off' : 'i-lucide-eye'"

                            >
                              {{ showExample ? t('common.hideExample') : t('common.showExample') }}
                            </UButton>


                            <!-- Example JSON -->
                            <div v-if="showExample" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ t('translations.ui.exampleJsonFormat') }}</p>
                              <pre class="text-xs overflow-x-auto"><code>{{ exampleJson }}</code></pre>
                            </div>

                            <!-- Import Textarea -->
                            <UTextarea
                              v-model="bulkImportJson"
                              :placeholder="t('translations.ui.pasteJsonHere')"
                              :rows="10"
                              class="font-mono text-sm w-full"
                            />

                            <!-- Import Button -->
                            <div class="flex justify-end gap-2">
                              <UButton
                                @click="bulkImportJson = ''"
                                variant="ghost"
                                :disabled="!bulkImportJson || importing"
                              >
                                {{ t('translations.ui.clear') }}
                              </UButton>
                              <UButton
                                @click="handleBulkImport"
                                :loading="importing"
                                :disabled="!bulkImportJson"
                                color="green"
                              >
                                {{ t('translations.ui.importTranslations') }}
                              </UButton>
                            </div>
                          </div>
                        </UCard>
                      </template>
                    </UModal>


                  </div>
                </template>
              </UModal>



            </template>
          </CrudTableHeader>
      </template>

      <template #values-cell="{ row }">
        <div class="text-sm">
          <TranslationsDisplay :translations="row.original.values" />
        </div>
      </template>

      <template #isOverrideable-cell="{ row }">
        <UBadge
          :color="row.original.isOverrideable ? 'primary' : 'error'"
          variant="soft"
        >
          {{ row.original.isOverrideable ? 'Yes' : 'No' }}
        </UBadge>
      </template>

      <template #overrideCount-cell="{ row }">
        <UButton
          v-if="row.overrideCount > 0"
          @click="openOverridesModal(row)"
          variant="soft"
          color="blue"
          size="xs"
        >
          {{ row.overrideCount }} {{ row.overrideCount === 1 ? t('team.team', 'team') : t('team.teams', 'teams') }}
        </UButton>
        <span v-else class="text-gray-400 text-sm">{{ t('translations.ui.none') }}</span>
      </template>
    </CrudTable>

    <!-- Overrides Modal -->
    <UModal v-model:open="showOverridesModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold">{{ t('translations.ui.teamOverrides') }}</h3>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-lucide-x"
                size="sm"
                @click="showOverridesModal = false"
              />
            </div>
          </template>

          <div v-if="selectedTranslation" class="space-y-4">
            <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <p class="text-sm font-medium mb-2">{{ t('translations.ui.systemTranslation') }}: {{ selectedTranslation.keyPath }}</p>
              <TranslationsDisplay :translations="selectedTranslation.values" />
            </div>

            <div v-if="loadingOverrides" class="flex items-center justify-center py-8">
              <UIcon name="i-lucide-loader-2" class="animate-spin w-5 h-5 mr-2" />
              <span>{{ t('translations.ui.loadingTeamOverrides') }}</span>
            </div>

            <div v-else-if="currentOverrides?.length" class="space-y-3">
              <h4 class="font-semibold text-sm">{{ t('translations.ui.teamCustomizations') }}</h4>
              <div
                v-for="override in currentOverrides"
                :key="override.id"
                class="border dark:border-gray-700 rounded p-3 space-y-2"
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium text-sm">{{ override.teamName || t('translations.ui.unknownTeam') }}</span>
                  <span class="text-xs text-gray-500">
                    {{ t('translations.ui.updated') }}: {{ new Date(override.updatedAt).toLocaleDateString() }}
                  </span>
                </div>
                <TranslationsDisplay :translations="override.values" />
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500">
              {{ t('translations.ui.noTeamOverridesFound') }}
            </div>
          </div>
        </UCard>
      </template>
    </UModal>



  </div>
</template>

<script setup lang="ts">
const { t } = useT()
const { columns, defaultPagination } = useTranslationsUi()
const { currentTeam } = useTeam()
const toast = useToast()
const route = useRoute()

// Use the standard collection composable for pagination
// This returns computed items directly from the collections store
const { items: translationsItems, pagination, refresh, pending } = useCollection('translationsUi')

// State for sync and import
const syncing = ref(false)
const importing = ref(false)
const importingFromLocales = ref(false)
const showExample = ref(false)
const bulkImportJson = ref('')

// State for overrides modal
const showOverridesModal = ref(false)
const selectedTranslation = ref<any>(null)
const currentOverrides = ref<any[]>([])
const loadingOverrides = ref(false)




const exampleJson = `{
  "translations": {
    "navigation": {
      "backToDashboard": {
        "en": "Back to Dashboard",
        "nl": "Terug naar Dashboard",
        "fr": "Retour au tableau de bord"
      },
      "home": {
        "en": "Home",
        "nl": "Home",
        "fr": "Accueil"
      }
    },
    "common": {
      "welcome": {
        "en": "Welcome",
        "nl": "Welkom",
        "fr": "Bienvenue"
      },
      "save": {
        "en": "Save",
        "nl": "Opslaan",
        "fr": "Sauvegarder"
      }
    }
  }
}`

// Import translations from locale files to database
async function importFromLocales(mode = 'replace') {
  console.log('🔵 Starting import from locales, mode:', mode)
  importingFromLocales.value = true
  try {
    const endpoint = mode === 'merge'
      ? '/api/super-admin/translations-ui/import-merge'
      : '/api/super-admin/translations-ui/import'

    console.log('🔵 Calling endpoint:', endpoint)
    const result = await $fetch(endpoint, {
      method: 'POST',
      onResponseError({ response }) {
        console.error('🔴 Response error:', response._data)
      }
    })
    console.log('🔵 Import result:', result)

    // Custom message based on mode and result
    let description = ''
    if (mode === 'merge' && result.details) {
      description = `${result.details.inserted} added, ${result.details.updated} updated, ${result.details.skipped} unchanged`
    } else {
      description = result.message || `Imported ${result.imported} translations from locale files`
    }

    toast.add({
      title: 'Import Successful',
      description,
      color: 'green',
      icon: 'i-lucide-circle-check'
    })

    // Refresh the list
    await refresh()
  } catch (error) {
    console.error('🔴 Import failed:', error)
    console.error('🔴 Error details:', error.data)
    toast.add({
      title: 'Import Failed',
      description: error.data?.statusMessage || 'Failed to import translations',
      color: 'red',
      icon: 'i-lucide-circle-x'
    })
  } finally {
    importingFromLocales.value = false
  }
}

// Sync translations to locale files
async function syncTranslations() {
  syncing.value = true
  try {
    const result = await $fetch('/api/super-admin/translations-ui/sync', {
      method: 'POST'
    })

    toast.add({
      title: 'Success',
      description: `Synced ${result.synced} translations to locale files`,
      color: 'green',
      icon: 'i-lucide-circle-check'
    })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error.data?.statusMessage || 'Failed to sync translations',
      color: 'red',
      icon: 'i-lucide-circle-x'
    })
  } finally {
    syncing.value = false
  }
}

// Handle bulk import
async function handleBulkImport() {
  importing.value = true

  try {
    // Parse and validate JSON
    const data = JSON.parse(bulkImportJson.value)

    if (!data.translations || typeof data.translations !== 'object') {
      throw new Error('Invalid format: expected { "translations": {...} }')
    }

    // Use the bulk-add endpoint which handles the nested object format
    const result = await $fetch('/api/super-admin/translations-ui/bulk-add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: data
    })

    // Show results
    const message = result.message || `Added ${result.added} translations, skipped ${result.skipped} (already exist)`

    toast.add({
      title: result.success ? 'Import Complete' : 'Import Failed',
      description: message,
      color: result.success ? 'green' : 'orange',
      icon: result.success ? 'i-lucide-circle-check' : 'i-lucide-triangle-alert'
    })

    // Refresh the table if any were added
    if (result.added > 0) {
      await refresh()
      bulkImportJson.value = ''
    }

  } catch (error) {
    toast.add({
      title: 'Import Error',
      description: error.message || 'Invalid JSON format',
      color: 'red',
      icon: 'i-lucide-circle-x'
    })
  } finally {
    importing.value = false
  }
}

// Open modal and fetch team overrides
async function openOverridesModal(translation: any) {
  selectedTranslation.value = translation
  showOverridesModal.value = true
  loadingOverrides.value = true
  currentOverrides.value = []

  try {
    const overrides = await $fetch(`/api/super-admin/translations-ui/overrides/${encodeURIComponent(translation.keyPath)}`, {
      query: { namespace: translation.namespace || 'ui' }
    })

    currentOverrides.value = overrides
  } catch (error) {
    console.error('Failed to fetch overrides:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to load team overrides',
      color: 'red',
      icon: 'i-lucide-circle-x'
    })
    currentOverrides.value = []
  } finally {
    loadingOverrides.value = false
  }
}
</script>
