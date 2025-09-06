import type { z } from 'zod'
import type { test4Schema } from './app/composables/useTest4s'

export interface Test4 {
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

export type Test4FormData = z.infer<typeof test4Schema>
export type NewTest4 = Omit<Test4, 'id' | 'createdAt' | 'updatedAt'>

// Props type for the Form component
export interface Test4FormProps {
  items: string[] // Array of IDs for delete action
  activeItem: Test4 | Record<string, never> // Test4 for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}