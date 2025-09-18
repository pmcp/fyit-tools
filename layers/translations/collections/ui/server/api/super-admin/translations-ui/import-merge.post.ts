import { readFile } from 'fs/promises'
import { join } from 'path'
import { eq, and, isNull } from 'drizzle-orm'

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
    // Step 1: Read and validate all locale files FIRST
    const locales: Record<string, any> = {}
    const localeList = ['en', 'nl', 'fr']

    for (const locale of localeList) {
      const filePath = join(localesDir, `${locale}.json`)
      try {
        const content = await readFile(filePath, 'utf-8')
        locales[locale] = JSON.parse(content)
      } catch (fileError) {
        const errorMessage = fileError instanceof Error ? fileError.message : 'Unknown error'
        throw new Error(`Failed to read or parse ${locale}.json: ${errorMessage}`)
      }
    }

    // Step 2: Extract and prepare all translations
    const keyPaths = new Map()

    function extractKeys(obj: Record<string, any>, prefix = '', locale: string) {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          extractKeys(value, fullKey, locale)
        } else {
          if (!keyPaths.has(fullKey)) {
            keyPaths.set(fullKey, {
              category: prefix || key,
              values: {} as Record<string, string>
            })
          }
          const pathData = keyPaths.get(fullKey)
          if (pathData) {
            pathData.values[locale] = value as string
          }
        }
      }
    }

    // Extract keys from all locales
    for (const [locale, content] of Object.entries(locales)) {
      extractKeys(content, '', locale)
    }

    // Step 3: Merge with existing translations
    const db = useDB()
    let updated = 0
    let inserted = 0
    let skipped = 0

    // Process each translation without transaction (D1 limitation in local dev)
    for (const [keyPath, data] of keyPaths.entries()) {
      try {
        // Check if translation already exists (system level)
        const existing = await db
          .select()
          .from(tables.translationsUi)
          .where(
            and(
              eq(tables.translationsUi.keyPath, keyPath),
              eq(tables.translationsUi.namespace, 'ui'),
              isNull(tables.translationsUi.teamId)
            )
          )
          .limit(1)

        if (existing.length > 0 && existing[0]) {
          // Check if values are different
          const existingValues = existing[0].values
          const newValues = data.values

          // Deep compare values
          const valuesChanged = JSON.stringify(existingValues) !== JSON.stringify(newValues)

          if (valuesChanged) {
            // Update existing translation
            await db
              .update(tables.translationsUi)
              .set({
                values: data.values,
                category: data.category.split('.')[0],
                updatedAt: new Date()
              })
              .where(eq(tables.translationsUi.id, existing[0].id))
            updated++
          } else {
            skipped++
          }
        } else {
          // Insert new translation
          await db
            .insert(tables.translationsUi)
            .values({
              teamId: null, // System-level translation
              userId: user.id,
              namespace: 'ui',
              keyPath,
              category: data.category.split('.')[0],
              values: data.values,
              description: null,
              isOverrideable: true
            })
          inserted++
        }
      } catch (itemError) {
        console.error(`Failed to process translation ${keyPath}:`, itemError)
        // Continue with next item instead of failing entire import
      }
    }

    return {
      success: true,
      message: `Merge complete: ${inserted} added, ${updated} updated, ${skipped} unchanged`,
      details: {
        inserted,
        updated,
        skipped,
        totalProcessed: keyPaths.size,
        locales: localeList
      }
    }
  } catch (error) {
    console.error('Merge import error details:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    throw createError({
      statusCode: 500,
      statusMessage: `Merge import failed: ${errorMessage}`,
    })
  }
})