import { ref, computed } from 'vue'
import type { TranslationsUi } from '../../types'

export const useTeamTranslations = () => {
  const { locale } = useI18n()
  const route = useRoute()
  
  // Get teamId from route or context
  const teamId = computed(() => {
    return route.params.teamId as string || route.params.id as string
  })
  
  // Cache for translations
  const translationsCache = ref<Record<string, TranslationsUi[]>>({})
  const loading = ref(false)
  const error = ref<Error | null>(null)
  
  // Fetch team translations (includes overrideable system translations)
  const fetchTranslations = async (forceRefresh = false) => {
    const tid = teamId.value
    if (!tid) return []
    
    const cacheKey = `${tid}-${locale.value}`
    
    // Return cached if available and not forcing refresh
    if (!forceRefresh && translationsCache.value[cacheKey]) {
      return translationsCache.value[cacheKey]
    }
    
    loading.value = true
    error.value = null
    
    try {
      const { data } = await $fetch(`/api/teams/${tid}/translations-ui`, {
        query: { locale: locale.value }
      })
      
      translationsCache.value[cacheKey] = data
      return data
    } catch (err) {
      error.value = err as Error
      console.error('Failed to fetch team translations:', err)
      return []
    } finally {
      loading.value = false
    }
  }
  
  // Resolve a translation with fallback
  const resolveTranslation = async (
    keyPath: string,
    namespace = 'ui',
    defaultValue?: string
  ): Promise<string> => {
    const tid = teamId.value
    if (!tid) return defaultValue || keyPath
    
    try {
      const { data } = await $fetch(`/api/teams/${tid}/translations-ui/resolve`, {
        query: {
          keyPath,
          namespace,
          locale: locale.value
        }
      })
      
      return data.value || defaultValue || keyPath
    } catch (err) {
      console.error('Failed to resolve translation:', err)
      return defaultValue || keyPath
    }
  }
  
  // Get translation from cache (sync method)
  const getTranslation = (
    keyPath: string,
    namespace = 'ui',
    defaultValue?: string
  ): string => {
    const tid = teamId.value
    if (!tid) return defaultValue || keyPath
    
    const cacheKey = `${tid}-${locale.value}`
    const translations = translationsCache.value[cacheKey] || []
    
    // Find in cache
    const translation = translations.find(
      t => t.keyPath === keyPath && t.namespace === namespace
    )
    
    if (translation?.values?.[locale.value]) {
      return translation.values[locale.value]
    }
    
    return defaultValue || keyPath
  }
  
  // Create or update a team translation
  const saveTranslation = async (
    keyPath: string,
    values: Record<string, string>,
    options: {
      category?: string
      namespace?: string
      description?: string
      translationId?: string
    } = {}
  ) => {
    const tid = teamId.value
    if (!tid) throw new Error('No team ID available')
    
    const payload = {
      keyPath,
      values,
      category: options.category || 'general',
      namespace: options.namespace || 'ui',
      description: options.description
    }
    
    try {
      if (options.translationId) {
        // Update existing
        await $fetch(`/api/teams/${tid}/translations-ui/${options.translationId}`, {
          method: 'PATCH',
          body: payload
        })
      } else {
        // Create new
        await $fetch(`/api/teams/${tid}/translations-ui`, {
          method: 'POST',
          body: payload
        })
      }
      
      // Refresh cache
      await fetchTranslations(true)
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }
  
  // Delete a team translation
  const deleteTranslation = async (translationId: string) => {
    const tid = teamId.value
    if (!tid) throw new Error('No team ID available')
    
    try {
      await $fetch(`/api/teams/${tid}/translations-ui/${translationId}`, {
        method: 'DELETE'
      })
      
      // Refresh cache
      await fetchTranslations(true)
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }
  
  // Initialize on mount
  onMounted(() => {
    if (teamId.value) {
      fetchTranslations()
    }
  })
  
  // Watch for locale changes
  watch(locale, () => {
    if (teamId.value) {
      fetchTranslations()
    }
  })
  
  return {
    teamId: readonly(teamId),
    translations: computed(() => {
      const tid = teamId.value
      if (!tid) return []
      const cacheKey = `${tid}-${locale.value}`
      return translationsCache.value[cacheKey] || []
    }),
    loading: readonly(loading),
    error: readonly(error),
    fetchTranslations,
    resolveTranslation,
    getTranslation,
    saveTranslation,
    deleteTranslation
  }
}

export default useTeamTranslations