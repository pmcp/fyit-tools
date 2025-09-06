import type { Event, NewEvent } from '../types'

export async function getAllEvents(teamId: string) {
  const db = useDB()
  
  const events = await db
    .select()
    .from(tables.events)
    .where(eq(tables.events.teamId, teamId))
    .orderBy(desc(tables.events.createdAt))
  
  return events
}

export async function getEventsByIds(teamId: string, ids: string[]) {
  const db = useDB()
  
  const events = await db
    .select()
    .from(tables.events)
    .where(
      and(
        eq(tables.events.teamId, teamId),
        inArray(tables.events.id, ids)
      )
    )
  
  return events
}

export async function createEvent(data: NewEvent) {
  const db = useDB()
  
  const [event] = await db
    .insert(tables.events)
    .values(data)
    .returning()
  
  return event
}

export async function updateEvent(eventId: string, teamId: string, userId: string, updates: Partial<Event>) {
  const db = useDB()
  
  const [event] = await db
    .update(tables.events)
    .set(updates)
    .where(
      and(
        eq(tables.events.id, eventId),
        eq(tables.events.teamId, teamId),
        eq(tables.events.userId, userId)
      )
    )
    .returning()
  
  if (!event) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Event not found or unauthorized'
    })
  }
  
  return event
}

export async function deleteEvent(eventId: string, teamId: string, userId: string) {
  const db = useDB()
  
  const [deleted] = await db
    .delete(tables.events)
    .where(
      and(
        eq(tables.events.id, eventId),
        eq(tables.events.teamId, teamId),
        eq(tables.events.userId, userId)
      )
    )
    .returning()
  
  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Event not found or unauthorized'
    })
  }
  
  return { success: true }
}