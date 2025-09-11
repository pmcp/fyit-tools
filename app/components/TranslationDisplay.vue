<template>
  <div class="flex flex-wrap gap-1.5">
    <template v-for="(lang, index) in languages" :key="lang">
      <UPopover 
        v-if="getTranslationLength(lang) > 0 && getTranslationLength(lang) <= 200"
        :content="{ side: 'top', align: 'center' }"
      >
        <UBadge
          :label="lang.toUpperCase()"
          :color="translations[lang] ? 'primary' : 'neutral'"
          variant="subtle"
          class="cursor-pointer hover:opacity-80 transition-opacity"
        />
        
        <template #content>
          <div class="p-3 max-w-sm">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-muted">{{ lang.toUpperCase() }}</span>
              <UButton
                icon="i-lucide-copy"
                size="xs"
                color="neutral"
                variant="ghost"
                @click="copyToClipboard(translations[lang])"
              />
            </div>
            <p class="text-sm break-words">{{ translations[lang] || 'No translation' }}</p>
            <div class="text-xs text-muted mt-2">
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
        class="opacity-50"
      />

      <UBadge
        v-else
        :label="lang.toUpperCase()"
        :color="translations[lang] ? 'primary' : 'neutral'"
        variant="subtle"
        class="cursor-pointer hover:opacity-80 transition-opacity"
        @click="openModal(lang)"
      />
    </template>

    <UModal v-model="modalOpen" :ui="{ width: 'max-w-2xl' }">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">
            Translation - {{ selectedLang?.toUpperCase() }}
          </h3>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            @click="modalOpen = false"
          />
        </div>

        <div class="space-y-4">
          <div class="bg-muted/10 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium text-muted">Content</span>
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

          <div class="flex gap-4 text-sm text-muted">
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
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClipboard } from '@vueuse/core'
import { toast } from 'vue-sonner'

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

const availableLanguages = computed(() => {
  if (props.languages && props.languages.length > 0) {
    return props.languages
  }
  return Object.keys(props.translations || {})
})

const languages = computed(() => {
  const langs = availableLanguages.value
  if (langs.length === 0) {
    return props.languages
  }
  return langs
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
    toast.error('No text to copy')
    return
  }
  
  try {
    await copy(text)
    toast.success('Copied to clipboard')
  } catch (error) {
    toast.error('Failed to copy text')
  }
}
</script>