import { deleteAllTranslationsUi, bulkCreateTranslationsUi } from '../../../database/queries'
import { readFile } from 'fs/promises'
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

  const localesDir = join(process.cwd(), 'layers', 'translations', 'i18n', 'locales')

  try {
    // Read all locale files
    const locales = {}
    for (const locale of ['en', 'nl', 'fr']) {
      const filePath = join(localesDir, `${locale}.json`)
      const content = await readFile(filePath, 'utf-8')
      locales[locale] = JSON.parse(content)
    }

    // Extract all unique key paths
    const keyPaths = new Map()

    function extractKeys(obj, prefix = '', locale) {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          extractKeys(value, fullKey, locale)
        } else {
          if (!keyPaths.has(fullKey)) {
            keyPaths.set(fullKey, {
              category: prefix || key,
              values: {}
            })
          }
          keyPaths.get(fullKey).values[locale] = value
        }
      }
    }

    // Extract keys from all locales
    for (const [locale, content] of Object.entries(locales)) {
      extractKeys(content, '', locale)
    }

    // Clear existing translations
    await deleteAllTranslationsUi()

    // Prepare translations for insertion
    const translations = []
    for (const [keyPath, data] of keyPaths.entries()) {
      translations.push({
        teamId: null, // System-level translation
        userId: user.id,
        namespace: 'ui',
        keyPath,
        category: data.category.split('.')[0], // Use first part as category
        values: data.values,
        description: null,
        isOverrideable: true
      })
    }

    // Bulk insert translations
    const inserted = await bulkCreateTranslationsUi(translations)

    return {
      success: true,
      message: 'Translations imported successfully',
      imported: inserted.length,
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to import translations: ${error.message}`,
    })
  }
})
