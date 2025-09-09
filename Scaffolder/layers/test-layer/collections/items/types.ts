import type { z } from 'zod'
import type { itemSchema } from './app/composables/useItems'

export interface Item {
  id: string
  teamId: string
  userId: string
  id?: string
  name: string
  price: number
  inStock?: boolean
  createdAt: Date
  updatedAt: Date
}

export type NewItem = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>

export type ItemInput = z.infer<typeof itemSchema>

export type ItemUpdate = Partial<Omit<Item, 'id' | 'teamId' | 'userId' | 'createdAt' | 'updatedAt'>>