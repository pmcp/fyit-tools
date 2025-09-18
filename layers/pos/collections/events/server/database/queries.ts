import type { PosEvent, NewPosEvent } from '../../types'

export async function getAllPosEvents(teamId: string) {
  const db = useDB()

  const events = await db
    .select()
    .from(tables.posEvents)
    .where(eq(tables.posEvents.teamId, teamId))
    .orderBy(desc(tables.posEvents.createdAt))

  return events
}

export async function getPosEventsByIds(teamId: string, eventIds: string[]) {
  const db = useDB()

  const events = await db
    .select()
    .from(tables.posEvents)
    .where(
      and(
        eq(tables.posEvents.teamId, teamId),
        inArray(tables.posEvents.id, eventIds)
      )
    )
    .orderBy(desc(tables.posEvents.createdAt))

  return events
}

export async function createPosEvent(data: NewPosEvent) {
  const db = useDB()

  const [event] = await db
    .insert(tables.posEvents)
    .values(data)
    .returning()

  return event
}

export async function updatePosEvent(
  eventId: string,
  teamId: string,
  userId: string,
  updates: Partial<PosEvent>
) {
  const db = useDB()

  const [event] = await db
    .update(tables.posEvents)
    .set(updates)
    .where(
      and(
        eq(tables.posEvents.id, eventId),
        eq(tables.posEvents.teamId, teamId),
        eq(tables.posEvents.userId, userId)
      )
    )
    .returning()

  if (!event) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosEvent not found or unauthorized'
    })
  }

  return event
}

export async function deletePosEvent(
  eventId: string,
  teamId: string,
  userId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posEvents)
    .where(
      and(
        eq(tables.posEvents.id, eventId),
        eq(tables.posEvents.teamId, teamId),
        eq(tables.posEvents.userId, userId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosEvent not found or unauthorized'
    })
  }

  return { success: true }
}