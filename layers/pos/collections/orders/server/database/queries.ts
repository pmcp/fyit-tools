import type { PosOrder, NewPosOrder } from '../../types'

export async function getAllPosOrders(teamId: string) {
  const db = useDB()

  const orders = await db
    .select()
    .from(tables.posOrders)
    .where(eq(tables.posOrders.teamId, teamId))
    .orderBy(desc(tables.posOrders.createdAt))

  return orders
}

export async function getPosOrdersByIds(teamId: string, orderIds: string[]) {
  const db = useDB()

  const orders = await db
    .select()
    .from(tables.posOrders)
    .where(
      and(
        eq(tables.posOrders.teamId, teamId),
        inArray(tables.posOrders.id, orderIds)
      )
    )
    .orderBy(desc(tables.posOrders.createdAt))

  return orders
}

export async function createPosOrder(data: NewPosOrder) {
  const db = useDB()

  const [order] = await db
    .insert(tables.posOrders)
    .values(data)
    .returning()

  return order
}

export async function updatePosOrder(
  orderId: string,
  teamId: string,
  userId: string,
  updates: Partial<PosOrder>
) {
  const db = useDB()

  const [order] = await db
    .update(tables.posOrders)
    .set(updates)
    .where(
      and(
        eq(tables.posOrders.id, orderId),
        eq(tables.posOrders.teamId, teamId),
        eq(tables.posOrders.userId, userId)
      )
    )
    .returning()

  if (!order) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosOrder not found or unauthorized'
    })
  }

  return order
}

export async function deletePosOrder(
  orderId: string,
  teamId: string,
  userId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posOrders)
    .where(
      and(
        eq(tables.posOrders.id, orderId),
        eq(tables.posOrders.teamId, teamId),
        eq(tables.posOrders.userId, userId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosOrder not found or unauthorized'
    })
  }

  return { success: true }
}