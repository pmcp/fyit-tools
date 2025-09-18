import { translationsUi } from '../../../database/schema'
import { isNull } from 'drizzle-orm'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
  // Check if user is super admin
  const { user } = await requireUserSession(event)
  if (!user.superAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Super admin access required',
    })
  }

  // Fetch only system translations (teamId = null) from database
  const db = useDB()
  const translations = await db
    .select()
    .from(translationsUi)
    .where(isNull(translationsUi.teamId))
    .all()

  const localesDir = join(process.cwd(), 'layers', 'translations', 'i18n', 'locales')
  
  // Load existing locale files
  const existingLocales: Record<string, Record<string, any>> = {
    en: {},
    nl: {},
    fr: {},
  }

  for (const locale of ['en', 'nl', 'fr']) {
    const filePath = join(localesDir, `${locale}.json`)
    if (existsSync(filePath)) {
      try {
        const content = await readFile(filePath, 'utf-8')
        existingLocales[locale] = JSON.parse(content)
      } catch (error) {
        console.warn(`Failed to read existing ${locale}.json:`, error)
        existingLocales[locale] = {}
      }
    }
  }

  // Merge database translations with existing ones
  for (const translation of translations) {
    const { category, keyPath, values } = translation

    // Type guard for values
    if (!values || typeof values !== 'object') continue

    const valuesObj = values as Record<string, string>

    // Create nested structure from keyPath (e.g., "auth.login" -> { auth: { login: value } })
    const keys = keyPath.split('.')

    for (const locale of ['en', 'nl', 'fr']) {
      if (!valuesObj[locale]) continue

      let current = existingLocales[locale]

      // Navigate/create the nested structure
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        if (!current || !key) break

        if (!current[key]) {
          current[key] = {}
        }

        if (current[key] && typeof current[key] === 'object') {
          current = current[key] as Record<string, any>
        } else {
          break
        }
      }

      // Set the final value (this will override existing value if present)
      const finalKey = keys[keys.length - 1]
      if (finalKey && current) {
        current[finalKey] = valuesObj[locale]
      }
    }
  }

  // Write merged content back to JSON files
  try {
    for (const [locale, content] of Object.entries(existingLocales)) {
      const filePath = join(localesDir, `${locale}.json`)
      await writeFile(filePath, JSON.stringify(content, null, 2), 'utf-8')
    }

    return {
      success: true,
      message: 'Translations synced to JSON files successfully',
      synced: translations.length,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to write translation files: ${errorMessage}`,
    })
  }
})