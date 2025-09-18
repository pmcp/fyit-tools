import type { PosLocation, NewPosLocation } from '../../types'

export async function getAllPosLocations(teamId: string) {
  const db = useDB()

  const locations = await db
    .select()
    .from(tables.posLocations)
    .where(eq(tables.posLocations.teamId, teamId))
    .orderBy(desc(tables.posLocations.createdAt))

  return locations
}

export async function getPosLocationsByIds(teamId: string, locationIds: string[]) {
  const db = useDB()

  const locations = await db
    .select()
    .from(tables.posLocations)
    .where(
      and(
        eq(tables.posLocations.teamId, teamId),
        inArray(tables.posLocations.id, locationIds)
      )
    )
    .orderBy(desc(tables.posLocations.createdAt))

  return locations
}

export async function createPosLocation(data: NewPosLocation) {
  const db = useDB()

  const [location] = await db
    .insert(tables.posLocations)
    .values(data)
    .returning()

  return location
}

export async function updatePosLocation(
  locationId: string,
  teamId: string,
  userId: string,
  updates: Partial<PosLocation>
) {
  const db = useDB()

  const [location] = await db
    .update(tables.posLocations)
    .set(updates)
    .where(
      and(
        eq(tables.posLocations.id, locationId),
        eq(tables.posLocations.teamId, teamId),
        eq(tables.posLocations.userId, userId)
      )
    )
    .returning()

  if (!location) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosLocation not found or unauthorized'
    })
  }

  return location
}

export async function deletePosLocation(
  locationId: string,
  teamId: string,
  userId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posLocations)
    .where(
      and(
        eq(tables.posLocations.id, locationId),
        eq(tables.posLocations.teamId, teamId),
        eq(tables.posLocations.userId, userId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosLocation not found or unauthorized'
    })
  }

  return { success: true }
}