import type { PosOrderProduct, NewPosOrderProduct } from '../../types'

export async function getAllPosOrderProducts(teamId: string) {
  const db = useDB()

  const orderproducts = await db
    .select()
    .from(tables.posOrderproducts)
    .where(eq(tables.posOrderproducts.teamId, teamId))
    .orderBy(desc(tables.posOrderproducts.createdAt))

  return orderproducts
}

export async function getPosOrderProductsByIds(teamId: string, orderproductIds: string[]) {
  const db = useDB()

  const orderproducts = await db
    .select()
    .from(tables.posOrderproducts)
    .where(
      and(
        eq(tables.posOrderproducts.teamId, teamId),
        inArray(tables.posOrderproducts.id, orderproductIds)
      )
    )
    .orderBy(desc(tables.posOrderproducts.createdAt))

  return orderproducts
}

export async function createPosOrderProduct(data: NewPosOrderProduct) {
  const db = useDB()

  const [orderproduct] = await db
    .insert(tables.posOrderproducts)
    .values(data)
    .returning()

  return orderproduct
}

export async function updatePosOrderProduct(
  orderproductId: string,
  teamId: string,
  userId: string,
  updates: Partial<PosOrderProduct>
) {
  const db = useDB()

  const [orderproduct] = await db
    .update(tables.posOrderproducts)
    .set(updates)
    .where(
      and(
        eq(tables.posOrderproducts.id, orderproductId),
        eq(tables.posOrderproducts.teamId, teamId),
        eq(tables.posOrderproducts.userId, userId)
      )
    )
    .returning()

  if (!orderproduct) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosOrderProduct not found or unauthorized'
    })
  }

  return orderproduct
}

export async function deletePosOrderProduct(
  orderproductId: string,
  teamId: string,
  userId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posOrderproducts)
    .where(
      and(
        eq(tables.posOrderproducts.id, orderproductId),
        eq(tables.posOrderproducts.teamId, teamId),
        eq(tables.posOrderproducts.userId, userId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosOrderProduct not found or unauthorized'
    })
  }

  return { success: true }
}