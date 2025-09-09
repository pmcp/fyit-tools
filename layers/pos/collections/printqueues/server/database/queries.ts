import type { PosPrintQueue, NewPosPrintQueue } from '../types'

export async function getAllPosPrintQueues(teamId: string) {
  const db = useDB()

  const printqueues = await db
    .select()
    .from(tables.posPrintqueues)
    .where(eq(tables.posPrintqueues.teamId, teamId))
    .orderBy(desc(tables.posPrintqueues.createdAt))

  return printqueues
}

export async function getPosPrintQueuesByIds(teamId: string, printqueueIds: string[]) {
  const db = useDB()

  const printqueues = await db
    .select()
    .from(tables.posPrintqueues)
    .where(
      and(
        eq(tables.posPrintqueues.teamId, teamId),
        inArray(tables.posPrintqueues.id, printqueueIds)
      )
    )
    .orderBy(desc(tables.posPrintqueues.createdAt))

  return printqueues
}

export async function createPosPrintQueue(data: NewPosPrintQueue) {
  const db = useDB()

  const [printqueue] = await db
    .insert(tables.posPrintqueues)
    .values(data)
    .returning()

  return printqueue
}

export async function updatePosPrintQueue(
  printqueueId: string,
  teamId: string,
  userId: string,
  updates: Partial<PosPrintQueue>
) {
  const db = useDB()

  const [printqueue] = await db
    .update(tables.posPrintqueues)
    .set(updates)
    .where(
      and(
        eq(tables.posPrintqueues.id, printqueueId),
        eq(tables.posPrintqueues.teamId, teamId),
        eq(tables.posPrintqueues.userId, userId)
      )
    )
    .returning()

  if (!printqueue) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosPrintQueue not found or unauthorized'
    })
  }

  return printqueue
}

export async function deletePosPrintQueue(
  printqueueId: string,
  teamId: string,
  userId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posPrintqueues)
    .where(
      and(
        eq(tables.posPrintqueues.id, printqueueId),
        eq(tables.posPrintqueues.teamId, teamId),
        eq(tables.posPrintqueues.userId, userId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosPrintQueue not found or unauthorized'
    })
  }

  return { success: true }
}