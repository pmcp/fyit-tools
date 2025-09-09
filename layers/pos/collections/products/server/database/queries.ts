import type { PosProduct, NewPosProduct } from '../types'

export async function getAllPosProducts(teamId: string) {
  const db = useDB()

  const products = await db
    .select()
    .from(tables.posProducts)
    .where(eq(tables.posProducts.teamId, teamId))
    .orderBy(desc(tables.posProducts.createdAt))

  return products
}

export async function getPosProductsByIds(teamId: string, productIds: string[]) {
  const db = useDB()

  const products = await db
    .select()
    .from(tables.posProducts)
    .where(
      and(
        eq(tables.posProducts.teamId, teamId),
        inArray(tables.posProducts.id, productIds)
      )
    )
    .orderBy(desc(tables.posProducts.createdAt))

  return products
}

export async function createPosProduct(data: NewPosProduct) {
  const db = useDB()

  const [product] = await db
    .insert(tables.posProducts)
    .values(data)
    .returning()

  return product
}

export async function updatePosProduct(
  productId: string,
  teamId: string,
  userId: string,
  updates: Partial<PosProduct>
) {
  const db = useDB()

  const [product] = await db
    .update(tables.posProducts)
    .set(updates)
    .where(
      and(
        eq(tables.posProducts.id, productId),
        eq(tables.posProducts.teamId, teamId),
        eq(tables.posProducts.userId, userId)
      )
    )
    .returning()

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosProduct not found or unauthorized'
    })
  }

  return product
}

export async function deletePosProduct(
  productId: string,
  teamId: string,
  userId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posProducts)
    .where(
      and(
        eq(tables.posProducts.id, productId),
        eq(tables.posProducts.teamId, teamId),
        eq(tables.posProducts.userId, userId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosProduct not found or unauthorized'
    })
  }

  return { success: true }
}