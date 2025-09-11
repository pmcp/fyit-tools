<template>
  <div class="space-y-6">
    <CrudTable
      collection="translationsSystem"
      :columns="columns"
      :rows="collectionTranslationsSystem"
    >
      <template #header>
          <CrudTableHeader
            title="System Translations"
            :collection="'translationsSystem'"
            createButton
          />

      </template>
    </CrudTable>

    <!-- Bulk Import Section -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Bulk Import Translations</h3>
          <UButton
            @click="showExample = !showExample"
            variant="ghost"
            size="sm"
            :icon="showExample ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          >
            {{ showExample ? 'Hide' : 'Show' }} Example
          </UButton>
        </div>
      </template>
      <UButton
        @click="syncTranslations"
        :loading="syncing"
        color="blue"
        variant="soft"
        icon="i-lucide-refresh-cw"
      >
        Sync to Locale Files
      </UButton>

      <div class="space-y-4">
        <!-- Example JSON -->
        <div v-if="showExample" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Example JSON format:</p>
          <pre class="text-xs overflow-x-auto"><code>{{ exampleJson }}</code></pre>
        </div>

        <!-- Import Textarea -->
        <UTextarea
          v-model="bulkImportJson"
          placeholder="Paste your JSON here..."
          :rows="10"
          class="font-mono text-sm"
        />

        <!-- Import Button -->
        <div class="flex justify-end gap-2">
          <UButton
            @click="bulkImportJson = ''"
            variant="ghost"
            :disabled="!bulkImportJson || importing"
          >
            Clear
          </UButton>
          <UButton
            @click="handleBulkImport"
            :loading="importing"
            :disabled="!bulkImportJson"
            color="green"
          >
            Import Translations
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { columns } = useTranslationsSystem()
const { currentTeam } = useTeam()
const { translationsSystem: collectionTranslationsSystem } = useCollections()
const toast = useToast()

// State for sync and import
const syncing = ref(false)
const importing = ref(false)
const showExample = ref(false)
const bulkImportJson = ref('')

const exampleJson = `{
  "translations": [
    {
      "keyPath": "navigation.backToDashboard",
      "category": "navigation",
      "values": {
        "en": "Back to Dashboard",
        "nl": "Terug naar Dashboard",
        "fr": "Retour au tableau de bord"
      },
      "description": "Link text to return to dashboard"
    },
    {
      "keyPath": "common.welcome",
      "category": "common",
      "values": {
        "en": "Welcome",
        "nl": "Welkom",
        "fr": "Bienvenue"
      },
      "description": "Welcome message"
    }
  ]
}`

const { data: systemTranslations, refresh } = await useFetch(
  `/api/super-admin/translations-system`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched system translation to the collection
if (systemTranslations.value) {
  collectionTranslationsSystem.value = systemTranslations.value
}

// Sync translations to locale files
async function syncTranslations() {
  syncing.value = true
  try {
    const result = await $fetch('/api/super-admin/translations-system/sync', {
      method: 'POST'
    })

    toast.add({
      title: 'Success',
      description: `Synced ${result.synced} translations to locale files`,
      color: 'green',
      icon: 'i-lucide-check-circle'
    })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error.data?.statusMessage || 'Failed to sync translations',
      color: 'red',
      icon: 'i-lucide-x-circle'
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

    if (!data.translations || !Array.isArray(data.translations)) {
      throw new Error('Invalid format: expected { "translations": [...] }')
    }

    let successCount = 0
    let skipCount = 0
    const errors = []

    // Process each translation
    for (const translation of data.translations) {
      try {
        await $fetch('/api/super-admin/translations-system', {
          method: 'POST',
          body: translation
        })
        successCount++
      } catch (error) {
        if (error.statusCode === 409) {
          // Already exists, skip
          skipCount++
        } else {
          errors.push(`${translation.keyPath}: ${error.data?.statusMessage || error.message}`)
        }
      }
    }

    // Show results
    let message = `Added ${successCount} translations`
    if (skipCount > 0) {
      message += `, skipped ${skipCount} (already exist)`
    }
    if (errors.length > 0) {
      message += `. Errors: ${errors.join(', ')}`
    }

    toast.add({
      title: successCount > 0 ? 'Import Complete' : 'Import Failed',
      description: message,
      color: successCount > 0 ? 'green' : 'orange',
      icon: successCount > 0 ? 'i-lucide-check-circle' : 'i-lucide-triangle-alert'
    })

    // Refresh the table if any were added
    if (successCount > 0) {
      await refresh()
      bulkImportJson.value = ''
    }

  } catch (error) {
    toast.add({
      title: 'Import Error',
      description: error.message || 'Invalid JSON format',
      color: 'red',
      icon: 'i-lucide-x-circle'
    })
  } finally {
    importing.value = false
  }
}
</script>
