import type { PosSystemLog, NewPosSystemLog } from '../types'

export async function getAllPosSystemLogs(teamId: string) {
  const db = useDB()

  const systemlogs = await db
    .select()
    .from(tables.posSystemlogs)
    .where(eq(tables.posSystemlogs.teamId, teamId))
    .orderBy(desc(tables.posSystemlogs.createdAt))

  return systemlogs
}

export async function getPosSystemLogsByIds(teamId: string, systemlogIds: string[]) {
  const db = useDB()

  const systemlogs = await db
    .select()
    .from(tables.posSystemlogs)
    .where(
      and(
        eq(tables.posSystemlogs.teamId, teamId),
        inArray(tables.posSystemlogs.id, systemlogIds)
      )
    )
    .orderBy(desc(tables.posSystemlogs.createdAt))

  return systemlogs
}

export async function createPosSystemLog(data: NewPosSystemLog) {
  const db = useDB()

  const [systemlog] = await db
    .insert(tables.posSystemlogs)
    .values(data)
    .returning()

  return systemlog
}

export async function updatePosSystemLog(
  systemlogId: string,
  teamId: string,
  userId: string,
  updates: Partial<PosSystemLog>
) {
  const db = useDB()

  const [systemlog] = await db
    .update(tables.posSystemlogs)
    .set(updates)
    .where(
      and(
        eq(tables.posSystemlogs.id, systemlogId),
        eq(tables.posSystemlogs.teamId, teamId),
        eq(tables.posSystemlogs.userId, userId)
      )
    )
    .returning()

  if (!systemlog) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosSystemLog not found or unauthorized'
    })
  }

  return systemlog
}

export async function deletePosSystemLog(
  systemlogId: string,
  teamId: string,
  userId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posSystemlogs)
    .where(
      and(
        eq(tables.posSystemlogs.id, systemlogId),
        eq(tables.posSystemlogs.teamId, teamId),
        eq(tables.posSystemlogs.userId, userId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosSystemLog not found or unauthorized'
    })
  }

  return { success: true }
}