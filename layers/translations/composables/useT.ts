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
    if (!currentTeam.value?.slug || teamTranslationsLoaded.value) return

    try {
      const data = await $fetch(`/api/teams/${currentTeam.value.slug}/translations-ui/with-system`, {
        query: { locale: locale.value }
      })

      if (data && Array.isArray(data)) {
        // Build a map of keyPath to values for quick lookup
        const translationMap: Record<string, string> = {}

        for (const item of data) {
          // Use team override if available, otherwise use system values
          const values = item.teamValues || item.systemValues
          if (values && values[locale.value]) {
            translationMap[item.keyPath] = values[locale.value]
          }
        }

        teamTranslations.value = translationMap
        teamTranslationsLoaded.value = true
      }
    } catch (error) {
      // Silently fail - team translations are optional
      console.debug('Failed to load team translations:', error)
    }
  }

  // Watch for team changes and reload translations
  watch(() => currentTeam.value?.slug, () => {
    teamTranslationsLoaded.value = false
    teamTranslations.value = {}
    loadTeamTranslations()
  }, { immediate: true })

  // Watch for locale changes and reload translations
  watch(locale, () => {
    teamTranslationsLoaded.value = false
    teamTranslations.value = {}
    loadTeamTranslations()
  })

  /**
   * Translate a key with team override support
   * @param key - Translation key (e.g., 'common.save')
   * @param params - Optional parameters for interpolation
   * @returns Translated string
   */
  const translate = (key: string, params?: Record<string, any>): string => {
    // Check team overrides first
    const teamOverride = teamTranslations.value?.[key]

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