export function useTrans() {
  const locale = useState('locale', () => 'en')

  function t(data: any, field: string): string {
    if (!data) return ''

    // Try translations first
    if (data.translations?.[locale.value]?.[field]) {
      return data.translations[locale.value][field]
    }

    // Fallback to main field
    return data[field] || ''
  }

  function setLocale(newLocale: string) {
    locale.value = newLocale
  }

  return { t, locale, setLocale }
}