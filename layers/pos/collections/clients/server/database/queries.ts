import type { PosClient, NewPosClient } from '../../types'

export async function getAllPosClients(teamId: string) {
  const db = useDB()

  const clients = await db
    .select()
    .from(tables.posClients)
    .where(eq(tables.posClients.teamId, teamId))
    .orderBy(desc(tables.posClients.createdAt))

  return clients
}

export async function getPosClientsByIds(teamId: string, clientIds: string[]) {
  const db = useDB()

  const clients = await db
    .select()
    .from(tables.posClients)
    .where(
      and(
        eq(tables.posClients.teamId, teamId),
        inArray(tables.posClients.id, clientIds)
      )
    )
    .orderBy(desc(tables.posClients.createdAt))

  return clients
}

export async function createPosClient(data: NewPosClient) {
  const db = useDB()

  const [client] = await db
    .insert(tables.posClients)
    .values(data)
    .returning()

  return client
}

export async function updatePosClient(
  clientId: string,
  teamId: string,
  userId: string,
  updates: Partial<PosClient>
) {
  const db = useDB()

  const [client] = await db
    .update(tables.posClients)
    .set(updates)
    .where(
      and(
        eq(tables.posClients.id, clientId),
        eq(tables.posClients.teamId, teamId),
        eq(tables.posClients.userId, userId)
      )
    )
    .returning()

  if (!client) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosClient not found or unauthorized'
    })
  }

  return client
}

export async function deletePosClient(
  clientId: string,
  teamId: string,
  userId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posClients)
    .where(
      and(
        eq(tables.posClients.id, clientId),
        eq(tables.posClients.teamId, teamId),
        eq(tables.posClients.userId, userId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosClient not found or unauthorized'
    })
  }

  return { success: true }
}