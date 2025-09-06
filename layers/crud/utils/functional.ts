import { nanoid } from 'nanoid'

// Type collections
export interface OptimisticItem {
  optimisticId?: string
  optimisticAction?: string
  [key: string]: any
}

// Pure transformation functions - no side effects
export const addOptimisticFlags = <T extends Record<string, any>>(
  item: T,
  action: string
): T & OptimisticItem => ({
  ...item,
  optimisticId: nanoid(10),
  optimisticAction: action
})

// Immutable collection operations
export const addToCollection = <T>(collection: T[], item: T): T[] =>
  [...collection, item]

export const removeFromCollection = <T extends { id: string | number }>(
  collection: T[],
  ids: (string | number)[]
): T[] =>
  collection.filter(item => !ids.includes(item.id))

export const updateInCollection = <T extends { id: string | number }>(
  collection: T[],
  id: string | number,
  updates: Partial<T>
): T[] =>
  collection.map(item =>
    item.id === id ? { ...item, ...updates } : item
  )

export const replaceByOptimisticId = <T extends OptimisticItem>(
  collection: T[],
  optimisticId: string,
  replacement: T
): T[] =>
  collection.map(item =>
    item.optimisticId === optimisticId ? replacement : item
  )

export const findInCollection = <T extends { id: string | number }>(
  collection: T[],
  id: string | number
): T | undefined =>
  collection.find(item => item.id === id)

export const findIndexInCollection = <T extends { id: string | number }>(
  collection: T[],
  id: string | number
): number =>
  collection.findIndex(item => item.id === id)

// Functional composition utilities
export const pipe = <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T =>
    fns.reduce((acc, fn) => fn(acc), value)

export const compose = <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T =>
    fns.reduceRight((acc, fn) => fn(acc), value)

// Identity function for default transforms
export const identity = <T>(x: T): T => x

// Curried API builder
export const createApiCall = (method: string) =>
  (endpoint: string) =>
    (data?: any, options?: RequestInit) =>
      $fetch(endpoint, {
        method,
        body: data,
        ...options
      })

// Specific API methods
export const apiGet = createApiCall('GET')
export const apiPost = createApiCall('POST')
export const apiPatch = createApiCall('PATCH')
export const apiDelete = createApiCall('DELETE')

// Transform test to optimistic state
export const applyOptimisticCreate = <T>(
  collection: T[],
  item: T,
  action: string = 'create'
): { collection: T[], optimisticItem: T & OptimisticItem } => {
  const optimisticItem = addOptimisticFlags(item, action)
  return {
    collection: addToCollection(collection, optimisticItem),
    optimisticItem
  }
}

export const applyOptimisticUpdate = <T extends { id: string | number }>(
  collection: T[],
  id: string | number,
  updates: Partial<T>,
  action: string = 'update'
): { collection: T[], optimisticItem: T & OptimisticItem | undefined } => {
  const item = findInCollection(collection, id)
  if (!item) return { collection, optimisticItem: undefined }

  const optimisticItem = addOptimisticFlags({ ...item, ...updates }, action)
  return {
    collection: updateInCollection(collection, id, optimisticItem),
    optimisticItem
  }
}

export const applyOptimisticDelete = <T extends { id: string | number }>(
  collection: T[],
  ids: (string | number)[],
  action: string = 'delete'
): { collection: T[], deletedIds: (string | number)[] } => ({
  collection: removeFromCollection(collection, ids),
  deletedIds: ids
})

// Rollback functions
export const rollbackCreate = <T extends OptimisticItem>(
  collection: T[],
  optimisticId: string
): T[] =>
  collection.filter(item => item.optimisticId !== optimisticId)

export const rollbackUpdate = <T extends { id: string | number } & OptimisticItem>(
  collection: T[],
  originalItem: T
): T[] =>
  updateInCollection(collection, originalItem.id, originalItem)

export const rollbackDelete = <T>(
  collection: T[],
  deletedItems: T[]
): T[] =>
  [...collection, ...deletedItems]
