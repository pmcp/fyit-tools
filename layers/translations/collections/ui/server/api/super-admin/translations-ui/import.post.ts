import { readFile } from 'fs/promises'
import { join } from 'path'
import { count } from 'drizzle-orm'
import { translationsUi } from '../../../database/schema'

interface LocaleContent {
  [key: string]: any
}

interface KeyPathData {
  category: string
  values: Record<string, any>
}

export default defineEventHandler(async (event) => {
  console.log('🔵 Import endpoint called')

  // Check if user is super admin
  const { user } = await requireUserSession(event)
  console.log('🔵 User:', user?.email, 'SuperAdmin:', user?.superAdmin)

  if (!user.superAdmin) {
    console.error('🔴 User is not super admin')
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Super admin access required',
    })
  }

  const localesDir = join(process.cwd(), 'layers', 'translations', 'i18n', 'locales')
  console.log('🔵 Reading locale files from:', localesDir)

  try {
    // Step 1: Read and validate all locale files FIRST
    const locales: Record<string, LocaleContent> = {}
    const localeList = ['en', 'nl', 'fr']

    for (const locale of localeList) {
      const filePath = join(localesDir, `${locale}.json`)
      try {
        const content = await readFile(filePath, 'utf-8')
        locales[locale] = JSON.parse(content)
      } catch (fileError: any) {
        throw new Error(`Failed to read or parse ${locale}.json: ${fileError.message}`)
      }
    }

    // Step 2: Extract and prepare all translations
    const keyPaths = new Map<string, KeyPathData>()

    function extractKeys(obj: any, prefix: string = '', locale: string) {
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
          const data = keyPaths.get(fullKey)
          if (data) {
            data.values[locale] = value
          }
        }
      }
    }

    // Extract keys from all locales
    for (const [locale, content] of Object.entries(locales)) {
      extractKeys(content, '', locale)
    }

    // Step 3: Prepare translations for insertion
    console.log('🔵 Found', keyPaths.size, 'unique key paths')
    const translations = []
    for (const [keyPath, data] of keyPaths.entries()) {
      const category = data.category.split('.')[0] || 'default'
      translations.push({
        teamId: undefined, // System-level translation (null in database)
        userId: user.id,
        namespace: 'ui',
        keyPath,
        category,
        values: data.values,
        description: undefined,
        isOverrideable: true
      })
    }

    // Validate we have translations to import
    if (translations.length === 0) {
      throw new Error('No translations found in locale files')
    }

    // Step 4: Import translations (without transaction due to D1 limitation)
    console.log('🔵 Importing', translations.length, 'translations to database')
    const db = useDB()
    let inserted: any[] = []

    try {
      // Delete all existing translations first
      console.log('🔵 Deleting existing translations')
      const deleteResult = await db.delete(translationsUi)
      console.log('🔵 Delete result:', deleteResult)

      // Insert new translations in batches to avoid SQLite variable limit
      if (translations.length > 0) {
        console.log('🔵 Inserting new translations')
        console.log('🔵 First translation sample:', translations[0])

        // Batch size - SQLite typically has a limit of 999 variables
        // With 11 fields per record (11 * 10 = 110 variables per batch)
        const BATCH_SIZE = 10
        let insertedCount = 0

        for (let i = 0; i < translations.length; i += BATCH_SIZE) {
          const batch = translations.slice(i, i + BATCH_SIZE)
          console.log(`🔵 Inserting batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(translations.length/BATCH_SIZE)} (${batch.length} records)`)

          // Insert without returning to avoid variable limit issues
          await db
            .insert(translationsUi)
            .values(batch)

          insertedCount += batch.length
        }

        console.log('🔵 Insert completed, total inserted:', insertedCount)

        // Count the total records in database to verify
        const countResult = await db
          .select({ count: count() })
          .from(translationsUi)

        const totalCount = countResult[0]?.count || 0
        console.log('🔵 Total records now in database:', totalCount)

        // For the response, use the translations array since we don't have returning()
        inserted = translations
      }
    } catch (dbError: any) {
      console.error('🔴 Database error:', dbError)
      throw new Error(`Database operation failed: ${dbError.message}`)
    }

    console.log('🔵 Returning response, inserted.length:', inserted.length)
    return {
      success: true,
      message: `Successfully imported ${inserted.length} translations from ${localeList.join(', ')} locale files`,
      imported: inserted.length,
      details: {
        keyPaths: Array.from(keyPaths.keys()).slice(0, 10),
        locales: localeList
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to import translations',
    })
  }
})