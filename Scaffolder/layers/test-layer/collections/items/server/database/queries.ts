import type { Item, NewItem } from '../types'

export async function getAllItems(teamId: string) {
  const db = useDB()

  const items = await db
    .select()
    .from(tables.testLayerItems)
    .where(eq(tables.testLayerItems.teamId, teamId))
    .orderBy(desc(tables.testLayerItems.createdAt))

  return items
}

export async function getItemsByIds(teamId: string, itemIds: string[]) {
  const db = useDB()

  const items = await db
    .select()
    .from(tables.testLayerItems)
    .where(
      and(
        eq(tables.testLayerItems.teamId, teamId),
        inArray(tables.testLayerItems.id, itemIds)
      )
    )
    .orderBy(desc(tables.testLayerItems.createdAt))

  return items
}

export async function createItem(item: NewItem) {
  const db = useDB()

  const [createdItem] = await db
    .insert(tables.testLayerItems)
    .values({
      ...item,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning()

  return createdItem
}

export async function updateItem(
  itemId: string,
  teamId: string,
  userId: string,
  updates: Partial<Item>
) {
  const db = useDB()

  const [updatedItem] = await db
    .update(tables.testLayerItems)
    .set({
      ...updates,
      updatedAt: new Date()
    })
    .where(
      and(
        eq(tables.testLayerItems.id, itemId),
        eq(tables.testLayerItems.teamId, teamId),
        eq(tables.testLayerItems.userId, userId)
      )
    )
    .returning()

  if (!updatedItem) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Item not found or unauthorized'
    })
  }

  return updatedItem
}

export async function deleteItem(
  itemId: string,
  teamId: string,
  userId: string
) {
  const db = useDB()

  const [deletedItem] = await db
    .delete(tables.testLayerItems)
    .where(
      and(
        eq(tables.testLayerItems.id, itemId),
        eq(tables.testLayerItems.teamId, teamId),
        eq(tables.testLayerItems.userId, userId)
      )
    )
    .returning()

  if (!deletedItem) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Item not found or unauthorized'
    })
  }

  return deletedItem
}