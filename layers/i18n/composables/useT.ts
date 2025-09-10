/**
 * Translation composable with team override support
 * 
 * This composable provides a translation function that:
 * 1. First checks team-specific overrides
 * 2. Falls back to system translations
 * 3. Returns the key if no translation found
 */
export function useT() {
  const { t, locale } = useI18n()
  const { currentTeam } = useTeam()
  
  // Cache for team translations to avoid repeated API calls
  const teamTranslations = useState<Record<string, any>>('teamTranslations', () => ({}))
  const teamTranslationsLoaded = useState<boolean>('teamTranslationsLoaded', () => false)
  
  // Load team translations if not already loaded
  const loadTeamTranslations = async () => {
    if (!currentTeam.value?.id || teamTranslationsLoaded.value) return
    
    try {
      const { data } = await $fetch(`/api/teams/${currentTeam.value.id}/settings/translations`)
      if (data?.translations) {
        teamTranslations.value = data.translations
        teamTranslationsLoaded.value = true
      }
    } catch (error) {
      // Silently fail - team translations are optional
      console.debug('Failed to load team translations:', error)
    }
  }
  
  // Watch for team changes and reload translations
  watch(() => currentTeam.value?.id, () => {
    teamTranslationsLoaded.value = false
    teamTranslations.value = {}
    loadTeamTranslations()
  }, { immediate: true })
  
  /**
   * Translate a key with team override support
   * @param key - Translation key (e.g., 'common.save')
   * @param params - Optional parameters for interpolation
   * @returns Translated string
   */
  const translate = (key: string, params?: Record<string, any>): string => {
    // Check team overrides first
    const teamOverride = teamTranslations.value?.[locale.value]?.[key]
    
    if (teamOverride) {
      // Simple parameter replacement for team overrides
      if (params) {
        return teamOverride.replace(/\{(\w+)\}/g, (_: string, k: string) => 
          params[k]?.toString() || ''
        )
      }
      return teamOverride
    }
    
    // Fall back to system translation
    return t(key, params)
  }
  
  // Also expose a method to invalidate cache
  const refreshTranslations = async () => {
    teamTranslationsLoaded.value = false
    await loadTeamTranslations()
  }
  
  return {
    t: translate,
    refreshTranslations,
    locale
  }
}