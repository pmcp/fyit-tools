import type { TranslationsUi, NewTranslationsUi } from '../../types'
import { createError } from 'h3'
import { and, eq, isNull, or, not, count, desc, inArray } from 'drizzle-orm'

export async function getAllTranslationsUi() {
  const db = useDB()

  const translations = await db
    .select()
    .from(tables.translationsUi)
    .orderBy(desc(tables.translationsUi.createdAt))

  return translations
}

export async function getTranslationsUiByIds(uiIds: string[]) {
  const db = useDB()

  const translations = await db
    .select()
    .from(tables.translationsUi)
    .where(inArray(tables.translationsUi.id, uiIds))
    .orderBy(desc(tables.translationsUi.createdAt))

  return translations
}

export async function createTranslationsUi(data: NewTranslationsUi) {
  const db = useDB()

  const [translation] = await db
    .insert(tables.translationsUi)
    .values(data)
    .returning()

  return translation
}

export async function updateTranslationsUi(
  uiId: string,
  updates: Partial<TranslationsUi>
) {
  const db = useDB()

  const [translation] = await db
    .update(tables.translationsUi)
    .set(updates)
    .where(eq(tables.translationsUi.id, uiId))
    .returning()

  if (!translation) {
    throw createError({
      statusCode: 404,
      statusMessage: 'TranslationsUi not found or unauthorized'
    })
  }

  return translation
}

export async function deleteTranslationsUi(uiId: string) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.translationsUi)
    .where(eq(tables.translationsUi.id, uiId))
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'TranslationsUi not found or unauthorized'
    })
  }

  return { success: true }
}

// Delete all translations (for import/reset operations)
export async function deleteAllTranslationsUi() {
  const db = useDB()

  await db
    .delete(tables.translationsUi)
    .returning()

  return { success: true }
}

// Bulk create translations
export async function bulkCreateTranslationsUi(translations: NewTranslationsUi[]) {
  const db = useDB()

  if (translations.length === 0) {
    return []
  }

  const inserted = await db
    .insert(tables.translationsUi)
    .values(translations)
    .returning()

  return inserted
}

// Get system translations only (teamId = null)
export async function getSystemTranslations() {
  const db = useDB()

  const translations = await db
    .select()
    .from(tables.translationsUi)
    .where(isNull(tables.translationsUi.teamId))
    .orderBy(desc(tables.translationsUi.createdAt))

  return translations
}

// Get overrideable system translations only
export async function getOverrideableSystemTranslations() {
  const db = useDB()

  const translations = await db
    .select()
    .from(tables.translationsUi)
    .where(
      and(
        isNull(tables.translationsUi.teamId),
        eq(tables.translationsUi.isOverrideable, true)
      )
    )
    .orderBy(desc(tables.translationsUi.createdAt))

  return translations
}

// Get team-specific translations
export async function getTeamTranslations(teamId: string) {
  const db = useDB()

  const translations = await db
    .select()
    .from(tables.translationsUi)
    .where(eq(tables.translationsUi.teamId, teamId))
    .orderBy(desc(tables.translationsUi.createdAt))

  return translations
}

// Get team translations with overrideable system translations
export async function getTeamAndSystemTranslations(teamId: string) {
  const db = useDB()

  const translations = await db
    .select()
    .from(tables.translationsUi)
    .where(
      or(
        eq(tables.translationsUi.teamId, teamId),
        and(
          isNull(tables.translationsUi.teamId),
          eq(tables.translationsUi.isOverrideable, true)
        )
      )
    )
    .orderBy(desc(tables.translationsUi.createdAt))

  return translations
}

// Resolve translation with fallback chain
export async function resolveTranslation(
  teamId: string,
  keyPath: string,
  namespace: string = 'ui',
  locale: string = 'en'
) {
  const db = useDB()

  // Try team translation first
  const teamTranslation = await db
    .select()
    .from(tables.translationsUi)
    .where(
      and(
        eq(tables.translationsUi.teamId, teamId),
        eq(tables.translationsUi.keyPath, keyPath),
        eq(tables.translationsUi.namespace, namespace)
      )
    )
    .get()

  if (teamTranslation?.values?.[locale]) {
    return {
      source: 'team',
      value: teamTranslation.values[locale],
      translation: teamTranslation
    }
  }

  // Fall back to system translation
  const systemTranslation = await db
    .select()
    .from(tables.translationsUi)
    .where(
      and(
        isNull(translationsUi.teamId),
        eq(tables.translationsUi.keyPath, keyPath),
        eq(tables.translationsUi.namespace, namespace)
      )
    )
    .get()

  if (systemTranslation?.values?.[locale]) {
    return {
      source: 'system',
      value: systemTranslation.values[locale],
      translation: systemTranslation
    }
  }

  // No translation found
  return {
    source: 'none',
    value: keyPath,
    translation: null
  }
}

// Get team overrides for a specific system translation
export async function getTeamOverridesForTranslation(
  keyPath: string,
  namespace: string = 'ui'
) {
  const db = useDB()

  const overrides = await db
    .select({
      id: tables.translationsUi.id,
      teamId: tables.translationsUi.teamId,
      teamName: tables.teams.name,
      values: tables.translationsUi.values,
      updatedAt: tables.translationsUi.updatedAt
    })
    .from(tables.translationsUi)
    .leftJoin(tables.teams, eq(tables.translationsUi.teamId, tables.teams.id))
    .where(
      and(
        eq(tables.translationsUi.keyPath, keyPath),
        eq(tables.translationsUi.namespace, namespace),
        not(isNull(tables.translationsUi.teamId))
      )
    )
    .orderBy(tables.teams.name)

  return overrides
}

// Get all system translations with override counts
export async function getAllSystemTranslationsWithOverrideCounts() {
  const db = useDB()

  // Get system translations
  const systemTranslations = await db
    .select()
    .from(tables.translationsUi)
    .where(isNull(tables.translationsUi.teamId))
    .orderBy(desc(tables.translationsUi.createdAt))

  // Get override counts for each system translation
  const overrideCounts = await db
    .select({
      keyPath: tables.translationsUi.keyPath,
      namespace: tables.translationsUi.namespace,
      count: count(tables.translationsUi.id).as('count')
    })
    .from(tables.translationsUi)
    .where(not(isNull(tables.translationsUi.teamId)))
    .groupBy(tables.translationsUi.keyPath, tables.translationsUi.namespace)

  // Merge the data
  const translationsWithCounts = systemTranslations.map(translation => {
    const overrideData = overrideCounts.find(
      oc => oc.keyPath === translation.keyPath && oc.namespace === translation.namespace
    )
    return {
      ...translation,
      overrideCount: overrideData?.count || 0
    }
  })

  return translationsWithCounts
}

// Bulk add translations with duplicate checking
export async function bulkAddTranslationsWithCheck(translations: NewTranslationsUi[]) {
  const db = useDB()

  if (translations.length === 0) {
    return {
      added: [],
      skipped: [],
      totalProcessed: 0
    }
  }

  // Get all existing system translation keys
  const existingKeys = await db
    .select({ keyPath: tables.translationsUi.keyPath })
    .from(tables.translationsUi)
    .where(isNull(tables.translationsUi.teamId))
    .all()

  const existingKeyPaths = new Set(existingKeys.map(k => k.keyPath))

  // Separate new and existing translations
  const newTranslations = []
  const skippedTranslations = []

  for (const translation of translations) {
    if (existingKeyPaths.has(translation.keyPath)) {
      skippedTranslations.push(translation.keyPath)
    } else {
      newTranslations.push(translation)
    }
  }

  // Insert translations one by one to avoid D1's SQL variable limit
  let inserted = []
  if (newTranslations.length > 0) {
    // D1 has strict limits on SQL variables, insert one at a time
    for (const translation of newTranslations) {
      try {
        const [insertedRow] = await db
          .insert(tables.translationsUi)
          .values(translation)
          .returning()
        
        inserted.push(insertedRow)
      } catch (error) {
        console.error(`Failed to insert translation ${translation.keyPath}:`, error)
        // Continue with other translations even if one fails
      }
    }
  }

  return {
    added: inserted,
    skipped: skippedTranslations,
    totalProcessed: translations.length
  }
}

// Process nested translation object and convert to flat database format
export function processTranslationObject(
  translationsObj: Record<string, any>,
  userId: string,
  teamId: string | null = null,
  namespace: string = 'ui'
): NewTranslationsUi[] {
  const translations: NewTranslationsUi[] = []

  function extractTranslations(obj: any, prefix: string = '') {
    for (const [key, value] of Object.entries(obj)) {
      const keyPath = prefix ? `${prefix}.${key}` : key

      // Check if this is a translation value object (has locale keys)
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Check if it looks like a translation values object
        const hasLocaleKeys = ['en', 'nl', 'fr'].some(locale => locale in value)

        if (hasLocaleKeys) {
          // This is a translation values object
          translations.push({
            teamId,
            userId,
            namespace,
            keyPath,
            category: prefix.split('.')[0] || key.split('.')[0],
            values: value,
            description: null,
            isOverrideable: true
          })
        } else {
          // This is a nested object, recurse
          extractTranslations(value, keyPath)
        }
      } else if (typeof value === 'string') {
        // Simple string value - use for all locales
        translations.push({
          teamId,
          userId,
          namespace,
          keyPath,
          category: prefix.split('.')[0] || key.split('.')[0],
          values: {
            en: value,
            nl: value,
            fr: value
          },
          description: null,
          isOverrideable: true
        })
      }
    }
  }

  extractTranslations(translationsObj)
  return translations
}

// Update or create translation (upsert)
export async function upsertTranslation(
  keyPath: string,
  values: Record<string, string>,
  options: {
    teamId?: string | null
    userId: string
    namespace?: string
    category?: string
    description?: string | null
    isOverrideable?: boolean
  }
) {
  const db = useDB()

  const {
    teamId = null,
    userId,
    namespace = 'ui',
    category = keyPath.split('.')[0],
    description = null,
    isOverrideable = true
  } = options

  // Check if translation exists
  const existing = await db
    .select()
    .from(tables.translationsUi)
    .where(
      and(
        teamId ? eq(tables.translationsUi.teamId, teamId) : isNull(tables.translationsUi.teamId),
        eq(tables.translationsUi.keyPath, keyPath),
        eq(tables.translationsUi.namespace, namespace)
      )
    )
    .get()

  if (existing) {
    // Update existing
    const [updated] = await db
      .update(tables.translationsUi)
      .set({
        values,
        description,
        isOverrideable,
        updatedAt: new Date()
      })
      .where(eq(tables.translationsUi.id, existing.id))
      .returning()

    return { action: 'updated', translation: updated }
  } else {
    // Create new
    const [created] = await db
      .insert(tables.translationsUi)
      .values({
        teamId,
        userId,
        namespace,
        keyPath,
        category,
        values,
        description,
        isOverrideable
      })
      .returning()

    return { action: 'created', translation: created }
  }
}
