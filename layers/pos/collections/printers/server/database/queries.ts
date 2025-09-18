import type { PosPrinter, NewPosPrinter } from '../../types'

export async function getAllPosPrinters(teamId: string) {
  const db = useDB()

  const printers = await db
    .select()
    .from(tables.posPrinters)
    .where(eq(tables.posPrinters.teamId, teamId))
    .orderBy(desc(tables.posPrinters.createdAt))

  return printers
}

export async function getPosPrintersByIds(teamId: string, printerIds: string[]) {
  const db = useDB()

  const printers = await db
    .select()
    .from(tables.posPrinters)
    .where(
      and(
        eq(tables.posPrinters.teamId, teamId),
        inArray(tables.posPrinters.id, printerIds)
      )
    )
    .orderBy(desc(tables.posPrinters.createdAt))

  return printers
}

export async function createPosPrinter(data: NewPosPrinter) {
  const db = useDB()

  const [printer] = await db
    .insert(tables.posPrinters)
    .values(data)
    .returning()

  return printer
}

export async function updatePosPrinter(
  printerId: string,
  teamId: string,
  userId: string,
  updates: Partial<PosPrinter>
) {
  const db = useDB()

  const [printer] = await db
    .update(tables.posPrinters)
    .set(updates)
    .where(
      and(
        eq(tables.posPrinters.id, printerId),
        eq(tables.posPrinters.teamId, teamId),
        eq(tables.posPrinters.userId, userId)
      )
    )
    .returning()

  if (!printer) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosPrinter not found or unauthorized'
    })
  }

  return printer
}

export async function deletePosPrinter(
  printerId: string,
  teamId: string,
  userId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posPrinters)
    .where(
      and(
        eq(tables.posPrinters.id, printerId),
        eq(tables.posPrinters.teamId, teamId),
        eq(tables.posPrinters.userId, userId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosPrinter not found or unauthorized'
    })
  }

  return { success: true }
}