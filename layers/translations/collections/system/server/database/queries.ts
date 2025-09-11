import type { TranslationsSystem, NewTranslationsSystem } from '../../types'
import { createError } from 'h3'

export async function getAllTranslationsSystem() {
  const db = useDB()

  const systemtranslations = await db
    .select()
    .from(tables.translationsSystem)
    .orderBy(desc(tables.translationsSystem.createdAt))

  return systemtranslations
}

export async function getTranslationsSystemByIds(systemIds: string[]) {
  const db = useDB()

  const systemtranslations = await db
    .select()
    .from(tables.translationsSystem)
    .where(inArray(tables.translationsSystem.id, systemIds))
    .orderBy(desc(tables.translationsSystem.createdAt))

  return systemtranslations
}

export async function createTranslationsSystem(data: NewTranslationsSystem) {
  const db = useDB()

  const [systemtranslation] = await db
    .insert(tables.translationsSystem)
    .values(data)
    .returning()

  return systemtranslation
}

export async function updateTranslationsSystem(
  systemId: string,
  updates: Partial<TranslationsSystem>
) {
  const db = useDB()

  const [systemtranslation] = await db
    .update(tables.translationsSystem)
    .set(updates)
    .where(eq(tables.translationsSystem.id, systemId))
    .returning()

  if (!systemtranslation) {
    throw createError({
      statusCode: 404,
      statusMessage: 'TranslationsSystem not found or unauthorized'
    })
  }

  return systemtranslation
}

export async function deleteTranslationsSystem(systemId: string) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.translationsSystem)
    .where(eq(tables.translationsSystem.id, systemId))
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'TranslationsSystem not found or unauthorized'
    })
  }

  return { success: true }
}