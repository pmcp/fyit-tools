import type { Test3, NewTest3 } from '../types'

export async function getAllTest3s(teamId: string) {
  const db = useDB()

  const test3s = await db
    .select()
    .from(tables.test3s)
    .where(eq(tables.test3s.teamId, teamId))
    .orderBy(desc(tables.test3s.createdAt))

  return test3s
}

export async function getTest3sByIds(teamId: string, ids: string[]) {
  const db = useDB()

  const test3s = await db
    .select()
    .from(tables.test3s)
    .where(
      and(
        eq(tables.test3s.teamId, teamId),
        inArray(tables.test3s.id, ids)
      )
    )

  return test3s
}

export async function createTest3(data: NewTest3) {
  const db = useDB()

  const [test3] = await db
    .insert(tables.test3s)
    .values(data)
    .returning()

  return test3
}

export async function updateTest3(test3Id: string, teamId: string, userId: string, updates: Partial<Test3>) {
  const db = useDB()

  const [test3] = await db
    .update(tables.test3s)
    .set(updates)
    .where(
      and(
        eq(tables.test3s.id, test3Id),
        eq(tables.test3s.teamId, teamId),
        eq(tables.test3s.userId, userId)
      )
    )
    .returning()

  if (!test3) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Test3 not found or unauthorized'
    })
  }

  return test3
}

export async function deleteTest3(test3Id: string, teamId: string, userId: string) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.test3s)
    .where(
      and(
        eq(tables.test3s.id, test3Id),
        eq(tables.test3s.teamId, teamId),
        eq(tables.test3s.userId, userId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Test3 not found or unauthorized'
    })
  }

  return { success: true }
}