import type { Test4, NewTest4 } from '../types'

export async function getAllTest4s(teamId: string) {
  const db = useDB()

  const test4s = await db
    .select()
    .from(tables.test4s)
    .where(eq(tables.test4s.teamId, teamId))
    .orderBy(desc(tables.test4s.createdAt))

  return test4s
}

export async function getTest4sByIds(teamId: string, ids: string[]) {
  const db = useDB()

  const test4s = await db
    .select()
    .from(tables.test4s)
    .where(
      and(
        eq(tables.test4s.teamId, teamId),
        inArray(tables.test4s.id, ids)
      )
    )

  return test4s
}

export async function createTest4(data: NewTest4) {
  const db = useDB()

  const [test4] = await db
    .insert(tables.test4s)
    .values(data)
    .returning()

  return test4
}

export async function updateTest4(test4Id: string, teamId: string, userId: string, updates: Partial<Test4>) {
  const db = useDB()

  const [test4] = await db
    .update(tables.test4s)
    .set(updates)
    .where(
      and(
        eq(tables.test4s.id, test4Id),
        eq(tables.test4s.teamId, teamId),
        eq(tables.test4s.userId, userId)
      )
    )
    .returning()

  if (!test4) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Test4 not found or unauthorized'
    })
  }

  return test4
}

export async function deleteTest4(test4Id: string, teamId: string, userId: string) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.test4s)
    .where(
      and(
        eq(tables.test4s.id, test4Id),
        eq(tables.test4s.teamId, teamId),
        eq(tables.test4s.userId, userId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Test4 not found or unauthorized'
    })
  }

  return { success: true }
}