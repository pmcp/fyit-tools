import type { TranslationsUi, NewTranslationsUi } from '../../types'
import { createError } from 'h3'
import { and, eq, isNull, or, not, count, desc } from 'drizzle-orm'

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
        isNull(tables.translationsUi.teamId),
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