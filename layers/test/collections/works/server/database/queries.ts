import type { Work, NewWork } from '../types'

export async function getAllWorks(teamId: string) {
  const db = useDB()
  
  const works = await db
    .select()
    .from(tables.works)
    .where(eq(tables.works.teamId, teamId))
    .orderBy(desc(tables.works.createdAt))
  
  return works
}

export async function getWorksByIds(teamId: string, ids: string[]) {
  const db = useDB()
  
  const works = await db
    .select()
    .from(tables.works)
    .where(
      and(
        eq(tables.works.teamId, teamId),
        inArray(tables.works.id, ids)
      )
    )
  
  return works
}

export async function createWork(data: NewWork) {
  const db = useDB()
  
  const [work] = await db
    .insert(tables.works)
    .values(data)
    .returning()
  
  return work
}

export async function updateWork(workId: string, teamId: string, userId: string, updates: Partial<Work>) {
  const db = useDB()
  
  const [work] = await db
    .update(tables.works)
    .set(updates)
    .where(
      and(
        eq(tables.works.id, workId),
        eq(tables.works.teamId, teamId),
        eq(tables.works.userId, userId)
      )
    )
    .returning()
  
  if (!work) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Work not found or unauthorized'
    })
  }
  
  return work
}

export async function deleteWork(workId: string, teamId: string, userId: string) {
  const db = useDB()
  
  const [deleted] = await db
    .delete(tables.works)
    .where(
      and(
        eq(tables.works.id, workId),
        eq(tables.works.teamId, teamId),
        eq(tables.works.userId, userId)
      )
    )
    .returning()
  
  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Work not found or unauthorized'
    })
  }
  
  return { success: true }
}