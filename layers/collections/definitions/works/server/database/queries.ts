import { eq, and, inArray, desc } from 'drizzle-orm'
import { worksTable } from './schema'
import type { Work, NewWork } from '../types'

export async function getAllWorks(teamId: string) {
  const db = useDB()
  
  const works = await db
    .select()
    .from(worksTable)
    .where(eq(worksTable.teamId, teamId))
    .orderBy(desc(worksTable.createdAt))
  
  return works
}

export async function getWorksByIds(teamId: string, ids: string[]) {
  const db = useDB()
  
  const works = await db
    .select()
    .from(worksTable)
    .where(
      and(
        eq(worksTable.teamId, teamId),
        inArray(worksTable.id, ids)
      )
    )
  
  return works
}

export async function createWork(data: NewWork) {
  const db = useDB()
  
  const [work] = await db
    .insert(worksTable)
    .values(data)
    .returning()
  
  return work
}

export async function updateWork(workId: string, teamId: string, userId: string, data: Partial<NewWork>) {
  const db = useDB()
  
  const [work] = await db
    .update(worksTable)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(
      and(
        eq(worksTable.id, workId),
        eq(worksTable.teamId, teamId),
        eq(worksTable.userId, userId)
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
    .delete(worksTable)
    .where(
      and(
        eq(worksTable.id, workId),
        eq(worksTable.teamId, teamId),
        eq(worksTable.userId, userId)
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