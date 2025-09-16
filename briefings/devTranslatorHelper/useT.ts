// composables/useT.ts
import { h, type VNode } from 'vue'

interface TranslationOptions {
  params?: Record<string, any>
  fallback?: string
  category?: string
  mode?: 'system' | 'team'
  placeholder?: string // What to show when translation is missing
}

export function useT() {
  const { t, locale } = useI18n()
  const route = useRoute()
  const team = useTeam() // Your existing team context
  const isDev = process.dev
  
  // Enhanced translation function that returns VNode in dev mode
  function translate(key: string, options: TranslationOptions = {}): string | VNode {
    const { params, fallback, category = 'ui', mode = 'team', placeholder } = options
    
    // Get the translated value
    let translatedValue: string
    let isTranslationMissing = false
    
    // Check team overrides first (if in team context)
    const teamSlug = route.params.team as string | undefined
    const override = teamSlug && team.value?.settings?.translations?.[locale.value]?.[key]
    
    if (override) {
      translatedValue = override
    } else {
      // Fall back to system translation
      const systemValue = t(key, params)
      
      // Check if translation is missing (i18n returns the key when not found)
      if (systemValue === key) {
        isTranslationMissing = true
        translatedValue = fallback || placeholder || `[${key}]`
      } else {
        translatedValue = systemValue
      }
    }
    
    // Apply parameter substitution
    if (params && translatedValue) {
      translatedValue = translatedValue.replace(/\{(\w+)\}/g, (_, k) => params[k] || '')
    }
    
    // In dev mode, wrap with DevTranslationWrapper
    if (isDev) {
      const DevTranslationWrapper = resolveComponent('DevTranslationWrapper')
      
      return h(DevTranslationWrapper, {
        translationKey: key,
        mode: teamSlug ? 'team' : 'system',
        category,
        currentValue: isTranslationMissing ? '' : translatedValue,
        isMissing: isTranslationMissing
      }, {
        default: () => translatedValue
      })
    }
    
    return translatedValue
  }
  
  // Simple string-only version for cases where VNode isn't supported
  function translateString(key: string, options: TranslationOptions = {}): string {
    const { params, fallback, placeholder } = options
    
    // Get team overrides
    const teamSlug = route.params.team as string | undefined
    const override = teamSlug && team.value?.settings?.translations?.[locale.value]?.[key]
    
    let value: string
    
    if (override) {
      value = override
    } else {
      const systemValue = t(key, params)
      
      // Check if translation is missing
      if (systemValue === key) {
        value = fallback || placeholder || `[${key}]`
      } else {
        value = systemValue
      }
    }
    
    // Apply parameter substitution
    if (params && value) {
      value = value.replace(/\{(\w+)\}/g, (_, k) => params[k] || '')
    }
    
    return value
  }
  
  // Reactive translation for content fields
  function translateContent(
    entity: any,
    field: string,
    preferredLocale?: string
  ): string {
    const loc = preferredLocale || locale.value
    
    // Try requested locale
    const translated = entity?.translations?.[loc]?.[field]
    if (translated) return translated
    
    // Try fallback locales
    const fallbacks = ['en', 'nl', 'fr']
    for (const fallbackLoc of fallbacks) {
      if (fallbackLoc === loc) continue // Skip the already tried locale
      const fallbackValue = entity?.translations?.[fallbackLoc]?.[field]
      if (fallbackValue) return fallbackValue
    }
    
    // Final fallback to the field itself
    return entity?.[field] || ''
  }
  
  // Check if a translation exists
  function hasTranslation(key: string): boolean {
    const teamSlug = route.params.team as string | undefined
    const override = teamSlug && team.value?.settings?.translations?.[locale.value]?.[key]
    
    if (override) return true
    
    const systemValue = t(key)
    return systemValue !== key
  }
  
  // Get all available locales for a translation key
  function getAvailableLocales(key: string): string[] {
    const teamSlug = route.params.team as string | undefined
    const availableLocales: string[] = []
    
    // Check team overrides
    if (teamSlug && team.value?.settings?.translations) {
      Object.keys(team.value.settings.translations).forEach(locale => {
        if (team.value?.settings?.translations?.[locale]?.[key]) {
          availableLocales.push(locale)
        }
      })
    }
    
    // Check system translations (simplified - you'd need to implement this)
    // This would require access to all system translations
    const systemLocales = ['en', 'nl', 'fr'] // Your supported locales
    systemLocales.forEach(loc => {
      // You'd need to check if the translation exists in that locale
      // For now, just assume it exists if not already in availableLocales
      if (!availableLocales.includes(loc)) {
        availableLocales.push(loc)
      }
    })
    
    return availableLocales
  }
  
  // Get translation with metadata (useful for admin interfaces)
  function getTranslationMeta(key: string) {
    const teamSlug = route.params.team as string | undefined
    const override = teamSlug && team.value?.settings?.translations?.[locale.value]?.[key]
    const systemValue = t(key)
    const isSystemMissing = systemValue === key
    
    return {
      key,
      value: override || systemValue,
      hasTeamOverride: !!override,
      isSystemMissing,
      availableLocales: getAvailableLocales(key)
    }
  }
  
  return {
    t: translate,
    tString: translateString,
    tContent: translateContent,
    hasTranslation,
    getAvailableLocales,
    getTranslationMeta
  }
}
