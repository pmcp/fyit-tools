import type { Test2, NewTest2 } from '../types'

export async function getAllTest2s(teamId: string) {
  const db = useDB()

  const test2s = await db
    .select()
    .from(tables.test2s)
    .where(eq(tables.test2s.teamId, teamId))
    .orderBy(desc(tables.test2s.createdAt))

  return test2s
}

export async function getTest2sByIds(teamId: string, ids: string[]) {
  const db = useDB()

  const test2s = await db
    .select()
    .from(tables.test2s)
    .where(
      and(
        eq(tables.test2s.teamId, teamId),
        inArray(tables.test2s.id, ids)
      )
    )

  return test2s
}

export async function createTest2(data: NewTest2) {
  const db = useDB()

  const [test2] = await db
    .insert(tables.test2s)
    .values(data)
    .returning()

  return test2
}

export async function updateTest2(test2Id: string, teamId: string, userId: string, updates: Partial<Test2>) {
  const db = useDB()

  const [test2] = await db
    .update(tables.test2s)
    .set(updates)
    .where(
      and(
        eq(tables.test2s.id, test2Id),
        eq(tables.test2s.teamId, teamId),
        eq(tables.test2s.userId, userId)
      )
    )
    .returning()

  if (!test2) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Test2 not found or unauthorized'
    })
  }

  return test2
}

export async function deleteTest2(test2Id: string, teamId: string, userId: string) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.test2s)
    .where(
      and(
        eq(tables.test2s.id, test2Id),
        eq(tables.test2s.teamId, teamId),
        eq(tables.test2s.userId, userId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Test2 not found or unauthorized'
    })
  }

  return { success: true }
}