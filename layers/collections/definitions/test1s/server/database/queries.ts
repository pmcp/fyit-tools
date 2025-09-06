import type { Test1, NewTest1 } from '../types'

export async function getAllTest1s(teamId: string) {
  const db = useDB()

  const test1s = await db
    .select()
    .from(tables.test1s)
    .where(eq(tables.test1s.teamId, teamId))
    .orderBy(desc(tables.test1s.createdAt))

  return test1s
}

export async function getTest1sByIds(teamId: string, ids: string[]) {
  const db = useDB()

  const test1s = await db
    .select()
    .from(tables.test1s)
    .where(
      and(
        eq(tables.test1s.teamId, teamId),
        inArray(tables.test1s.id, ids)
      )
    )

  return test1s
}

export async function createTest1(data: NewTest1) {
  const db = useDB()

  const [test1] = await db
    .insert(tables.test1s)
    .values(data)
    .returning()

  return test1
}

export async function updateTest1(test1Id: string, teamId: string, userId: string, updates: Partial<Test1>) {
  const db = useDB()

  const [test1] = await db
    .update(tables.test1s)
    .set(updates)
    .where(
      and(
        eq(tables.test1s.id, test1Id),
        eq(tables.test1s.teamId, teamId),
        eq(tables.test1s.userId, userId)
      )
    )
    .returning()

  if (!test1) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Test1 not found or unauthorized'
    })
  }

  return test1
}

export async function deleteTest1(test1Id: string, teamId: string, userId: string) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.test1s)
    .where(
      and(
        eq(tables.test1s.id, test1Id),
        eq(tables.test1s.teamId, teamId),
        eq(tables.test1s.userId, userId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Test1 not found or unauthorized'
    })
  }

  return { success: true }
}