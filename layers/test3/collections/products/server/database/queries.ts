import type { Product, NewProduct } from '../types'

export async function getAllProducts(teamId: string) {
  const db = useDB()

  const products = await db
    .select()
    .from(tables.products)
    .where(eq(tables.products.teamId, teamId))
    .orderBy(desc(tables.products.createdAt))

  return products
}

export async function getProductsByIds(teamId: string, ids: string[]) {
  const db = useDB()

  const products = await db
    .select()
    .from(tables.products)
    .where(
      and(
        eq(tables.products.teamId, teamId),
        inArray(tables.products.id, ids)
      )
    )

  return products
}

export async function createProduct(data: NewProduct) {
  const db = useDB()

  const [product] = await db
    .insert(tables.products)
    .values(data)
    .returning()

  return product
}

export async function updateProduct(productId: string, teamId: string, userId: string, updates: Partial<Product>) {
  const db = useDB()

  const [product] = await db
    .update(tables.products)
    .set(updates)
    .where(
      and(
        eq(tables.products.id, productId),
        eq(tables.products.teamId, teamId),
        eq(tables.products.userId, userId)
      )
    )
    .returning()

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found or unauthorized'
    })
  }

  return product
}

export async function deleteProduct(productId: string, teamId: string, userId: string) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.products)
    .where(
      and(
        eq(tables.products.id, productId),
        eq(tables.products.teamId, teamId),
        eq(tables.products.userId, userId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found or unauthorized'
    })
  }

  return { success: true }
}