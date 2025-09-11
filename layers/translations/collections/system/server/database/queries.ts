import type { TranslationsSystem, NewTranslationsSystem } from '../../types'

export async function getAllTranslationsSystem(teamId: string) {
  const db = useDB()

  const systemtranslations = await db
    .select()
    .from(tables.translationsSystem)
    .where(eq(tables.translationsSystem.teamId, teamId))
    .orderBy(desc(tables.translationsSystem.createdAt))

  return systemtranslations
}

export async function getTranslationsSystemByIds(teamId: string, systemIds: string[]) {
  const db = useDB()

  const systemtranslations = await db
    .select()
    .from(tables.translationsSystem)
    .where(
      and(
        eq(tables.translationsSystem.teamId, teamId),
        inArray(tables.translationsSystem.id, systemIds)
      )
    )
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
  teamId: string,
  userId: string,
  updates: Partial<TranslationsSystem>
) {
  const db = useDB()

  const [systemtranslation] = await db
    .update(tables.translationsSystem)
    .set(updates)
    .where(
      and(
        eq(tables.translationsSystem.id, systemId),
        eq(tables.translationsSystem.teamId, teamId),
        eq(tables.translationsSystem.userId, userId)
      )
    )
    .returning()

  if (!systemtranslation) {
    throw createError({
      statusCode: 404,
      statusMessage: 'TranslationsSystem not found or unauthorized'
    })
  }

  return systemtranslation
}

export async function deleteTranslationsSystem(
  systemId: string,
  teamId: string,
  userId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.translationsSystem)
    .where(
      and(
        eq(tables.translationsSystem.id, systemId),
        eq(tables.translationsSystem.teamId, teamId),
        eq(tables.translationsSystem.userId, userId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'TranslationsSystem not found or unauthorized'
    })
  }

  return { success: true }
}