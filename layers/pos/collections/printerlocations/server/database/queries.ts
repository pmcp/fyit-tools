import type { PosPrinterLocation, NewPosPrinterLocation } from '../../types'

export async function getAllPosPrinterLocations(teamId: string) {
  const db = useDB()

  const printerlocations = await db
    .select()
    .from(tables.posPrinterlocations)
    .where(eq(tables.posPrinterlocations.teamId, teamId))
    .orderBy(desc(tables.posPrinterlocations.createdAt))

  return printerlocations
}

export async function getPosPrinterLocationsByIds(teamId: string, printerlocationIds: string[]) {
  const db = useDB()

  const printerlocations = await db
    .select()
    .from(tables.posPrinterlocations)
    .where(
      and(
        eq(tables.posPrinterlocations.teamId, teamId),
        inArray(tables.posPrinterlocations.id, printerlocationIds)
      )
    )
    .orderBy(desc(tables.posPrinterlocations.createdAt))

  return printerlocations
}

export async function createPosPrinterLocation(data: NewPosPrinterLocation) {
  const db = useDB()

  const [printerlocation] = await db
    .insert(tables.posPrinterlocations)
    .values(data)
    .returning()

  return printerlocation
}

export async function updatePosPrinterLocation(
  printerlocationId: string,
  teamId: string,
  userId: string,
  updates: Partial<PosPrinterLocation>
) {
  const db = useDB()

  const [printerlocation] = await db
    .update(tables.posPrinterlocations)
    .set(updates)
    .where(
      and(
        eq(tables.posPrinterlocations.id, printerlocationId),
        eq(tables.posPrinterlocations.teamId, teamId),
        eq(tables.posPrinterlocations.userId, userId)
      )
    )
    .returning()

  if (!printerlocation) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosPrinterLocation not found or unauthorized'
    })
  }

  return printerlocation
}

export async function deletePosPrinterLocation(
  printerlocationId: string,
  teamId: string,
  userId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posPrinterlocations)
    .where(
      and(
        eq(tables.posPrinterlocations.id, printerlocationId),
        eq(tables.posPrinterlocations.teamId, teamId),
        eq(tables.posPrinterlocations.userId, userId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosPrinterLocation not found or unauthorized'
    })
  }

  return { success: true }
}