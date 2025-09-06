// Generic CRUD query utilities for test
// Collections can use these as base implementations or override with custom logic

import { H3Error } from 'h3'

export interface CrudQueryOptions {
  tableName: string
  teamIdField?: string
  userIdField?: string
  orderByField?: string
  orderDirection?: 'asc' | 'desc'
}

// Generic get all items for a collection
export const createGetAllQuery = (options: CrudQueryOptions) => {
  return async (teamId: string) => {
    const { tableName, teamIdField = 'teamId', orderByField = 'createdAt', orderDirection = 'desc' } = options

    try {
      const items = await useDB().query[tableName].findMany({
        where: and(eq(tables[tableName][teamIdField], teamId)),
        orderBy: orderDirection === 'desc'
          ? [desc(tables[tableName][orderByField])]
          : [asc(tables[tableName][orderByField])],
      })
      return items
    } catch (error) {
      console.error(error)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to get all ${tableName}`,
      })
    }
  }
}

// Generic get by IDs
export const createGetByIdsQuery = (options: CrudQueryOptions) => {
  return async (teamId: string, itemIds: string[]) => {
    const { tableName, teamIdField = 'teamId', orderByField = 'createdAt', orderDirection = 'desc' } = options

    try {
      const items = await useDB().query[tableName].findMany({
        where: and(
          eq(tables[tableName][teamIdField], teamId),
          inArray(tables[tableName].id, itemIds)
        ),
        orderBy: orderDirection === 'desc'
          ? [desc(tables[tableName][orderByField])]
          : [asc(tables[tableName][orderByField])],
      })
      return items
    } catch (error) {
      console.error(error)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to get ${tableName} by ids`,
      })
    }
  }
}

// Generic create
export const createInsertQuery = (options: CrudQueryOptions) => {
  return async (payload: any) => {
    const { tableName } = options

    try {
      const item = await useDB().insert(tables[tableName]).values(payload).returning()
      return item[0]
    } catch (error) {
      console.error(error)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create ${tableName}`,
      })
    }
  }
}

// Generic update
export const createUpdateQuery = (options: CrudQueryOptions) => {
  return async (itemId: string, teamId: string, userId: string, updates: any) => {
    const { tableName, teamIdField = 'teamId', userIdField = 'userId' } = options

    try {
      const item = await useDB()
        .update(tables[tableName])
        .set(updates)
        .where(
          and(
            eq(tables[tableName].id, itemId),
            eq(tables[tableName][teamIdField], teamId),
            eq(tables[tableName][userIdField], userId)
          )
        )
        .returning()

      if (!item[0]) {
        throw createError({
          statusCode: 404,
          statusMessage: `${tableName} not found or unauthorized`,
        })
      }

      return item[0]
    } catch (error) {
      if (error instanceof H3Error) throw error
      console.error(error)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update ${tableName}`,
      })
    }
  }
}

// Generic delete
export const createDeleteQuery = (options: CrudQueryOptions) => {
  return async (itemId: string, teamId: string, userId: string) => {
    const { tableName, teamIdField = 'teamId', userIdField = 'userId' } = options

    try {
      const item = await useDB()
        .delete(tables[tableName])
        .where(
          and(
            eq(tables[tableName].id, itemId),
            eq(tables[tableName][teamIdField], teamId),
            eq(tables[tableName][userIdField], userId)
          )
        )
        .returning()

      if (!item[0]) {
        throw createError({
          statusCode: 404,
          statusMessage: `${tableName} not found or unauthorized`,
        })
      }

      return item[0]
    } catch (error) {
      if (error instanceof H3Error) throw error
      console.error(error)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to delete ${tableName}`,
      })
    }
  }
}
