import type { PosCategorie, NewPosCategorie } from '../types'

export async function getAllPosCategories(teamId: string) {
  const db = useDB()

  const categories = await db
    .select()
    .from(tables.posCategories)
    .where(eq(tables.posCategories.teamId, teamId))
    .orderBy(desc(tables.posCategories.createdAt))

  return categories
}

export async function getPosCategoriesByIds(teamId: string, categorieIds: string[]) {
  const db = useDB()

  const categories = await db
    .select()
    .from(tables.posCategories)
    .where(
      and(
        eq(tables.posCategories.teamId, teamId),
        inArray(tables.posCategories.id, categorieIds)
      )
    )
    .orderBy(desc(tables.posCategories.createdAt))

  return categories
}

export async function createPosCategorie(data: NewPosCategorie) {
  const db = useDB()

  const [categorie] = await db
    .insert(tables.posCategories)
    .values(data)
    .returning()

  return categorie
}

export async function updatePosCategorie(
  categorieId: string,
  teamId: string,
  userId: string,
  updates: Partial<PosCategorie>
) {
  const db = useDB()

  const [categorie] = await db
    .update(tables.posCategories)
    .set(updates)
    .where(
      and(
        eq(tables.posCategories.id, categorieId),
        eq(tables.posCategories.teamId, teamId),
        eq(tables.posCategories.userId, userId)
      )
    )
    .returning()

  if (!categorie) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosCategorie not found or unauthorized'
    })
  }

  return categorie
}

export async function deletePosCategorie(
  categorieId: string,
  teamId: string,
  userId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posCategories)
    .where(
      and(
        eq(tables.posCategories.id, categorieId),
        eq(tables.posCategories.teamId, teamId),
        eq(tables.posCategories.userId, userId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosCategorie not found or unauthorized'
    })
  }

  return { success: true }
}