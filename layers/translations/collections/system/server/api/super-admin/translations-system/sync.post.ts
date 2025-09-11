import { translationsSystem } from '../../../database/schema'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  // Check if user is super admin
  const { user } = await requireUserSession(event)
  if (!user.superAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Super admin access required',
    })
  }

  // Fetch all translations from database
  const db = useDB()
  const translations = await db
    .select()
    .from(translationsSystem)
    .all()

  // Group translations by language and category
  const locales = {
    en: {},
    nl: {},
    fr: {},
  }

  for (const translation of translations) {
    const { category, keyPath, values } = translation
    
    // Create nested structure from keyPath (e.g., "auth.login" -> { auth: { login: value } })
    const keys = keyPath.split('.')
    
    for (const locale of ['en', 'nl', 'fr']) {
      if (!values[locale]) continue
      
      let current = locales[locale]
      
      // Navigate/create the nested structure
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }
      
      // Set the final value
      current[keys[keys.length - 1]] = values[locale]
    }
  }

  // Write to JSON files
  const localesDir = join(process.cwd(), 'layers', 'i18n', 'locales')
  
  try {
    for (const [locale, content] of Object.entries(locales)) {
      const filePath = join(localesDir, `${locale}.json`)
      await writeFile(filePath, JSON.stringify(content, null, 2), 'utf-8')
    }

    return {
      success: true,
      message: 'Translations synced to JSON files successfully',
      synced: translations.length,
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to write translation files: ${error.message}`,
    })
  }
})