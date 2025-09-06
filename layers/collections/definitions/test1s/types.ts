import type { z } from 'zod'
import type { test1Schema } from './app/composables/useTest1s'

export interface Test1 {
  id: string
  teamId: string
  userId: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type Test1FormData = z.infer<typeof test1Schema>
export type NewTest1 = Omit<Test1, 'id' | 'createdAt' | 'updatedAt'>

// Props type for the Form component
export interface Test1FormProps {
  items: string[] // Array of IDs for delete action
  activeItem: Test1 | Record<string, never> // Test1 for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}