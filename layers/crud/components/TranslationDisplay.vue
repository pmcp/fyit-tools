<template>
  <div class="flex flex-wrap gap-1.5">
    <template v-for="lang in languages" :key="lang">
      <UPopover 
        v-if="getTranslationLength(lang) > 0 && getTranslationLength(lang) <= 200"
      >
        <template #default="{ open }">
          <UBadge
            :label="lang.toUpperCase()"
            :color="translations[lang] ? 'primary' : 'neutral'"
            variant="subtle"
            class="cursor-pointer"
          />
        </template>
        
        <template #content>
          <div class="p-3 max-w-sm">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ lang.toUpperCase() }}</span>
              <UButton
                icon="i-lucide-copy"
                size="xs"
                color="neutral"
                variant="ghost"
                @click="copyToClipboard(translations[lang])"
              />
            </div>
            <p class="text-sm break-words">{{ translations[lang] || 'No translation' }}</p>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {{ getCharCount(lang) }} characters
            </div>
          </div>
        </template>
      </UPopover>

      <UBadge
        v-else-if="getTranslationLength(lang) === 0"
        :label="lang.toUpperCase()"
        color="neutral"
        variant="subtle"
      />

      <UBadge
        v-else
        :label="lang.toUpperCase()"
        :color="translations[lang] ? 'primary' : 'neutral'"
        variant="subtle"
        class="cursor-pointer"
        @click="openModal(lang)"
      />
    </template>

    <UModal v-model:open="modalOpen" :title="`Translation - ${selectedLang?.toUpperCase()}`">
      <template #default>

        <div class="p-6 space-y-4">
          <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Content</span>
              <UButton
                icon="i-lucide-copy"
                label="Copy"
                size="xs"
                color="neutral"
                variant="subtle"
                @click="copyToClipboard(translations[selectedLang])"
              />
            </div>
            <p class="text-sm break-words whitespace-pre-wrap">
              {{ translations[selectedLang] || 'No translation available' }}
            </p>
          </div>

          <div class="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div>
              <span class="font-medium">Characters:</span>
              {{ getCharCount(selectedLang) }}
            </div>
            <div>
              <span class="font-medium">Words:</span>
              {{ getWordCount(selectedLang) }}
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClipboard } from '@vueuse/core'

interface Props {
  translations: Record<string, string>
  languages?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  languages: () => ['en', 'fr', 'nl', 'de', 'es', 'it']
})

const modalOpen = ref(false)
const selectedLang = ref<string | null>(null)
const { copy } = useClipboard()
const toast = useToast()
const { locales } = useI18n()

// Get available languages from i18n config or props
const languages = computed(() => {
  // If custom languages provided via props, use those
  if (props.languages && props.languages.length > 0) {
    return props.languages
  }
  
  // Otherwise use i18n configured locales
  if (locales.value && locales.value.length > 0) {
    return locales.value.map(locale => 
      typeof locale === 'string' ? locale : locale.code
    )
  }
  
  // Fallback to translation keys if available
  return Object.keys(props.translations || {})
})

const getTranslationLength = (lang: string): number => {
  const translation = props.translations?.[lang]
  return translation ? translation.length : 0
}

const getCharCount = (lang: string): number => {
  return getTranslationLength(lang)
}

const getWordCount = (lang: string): number => {
  const translation = props.translations?.[lang]
  if (!translation) return 0
  return translation.trim().split(/\s+/).filter(word => word.length > 0).length
}

const openModal = (lang: string) => {
  selectedLang.value = lang
  modalOpen.value = true
}

const copyToClipboard = async (text: string) => {
  if (!text) {
    toast.add({ 
      title: 'No text to copy',
      color: 'error'
    })
    return
  }
  
  try {
    await copy(text)
    toast.add({ 
      title: 'Copied to clipboard',
      color: 'success'
    })
  } catch (error) {
    toast.add({ 
      title: 'Failed to copy text',
      color: 'error'
    })
  }
}
</script>