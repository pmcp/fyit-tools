import type { z } from 'zod'
import type { test2Schema } from './app/composables/useTest2s'

export interface Test2 {
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

export type Test2FormData = z.infer<typeof test2Schema>
export type NewTest2 = Omit<Test2, 'id' | 'createdAt' | 'updatedAt'>

// Props type for the Form component
export interface Test2FormProps {
  items: string[] // Array of IDs for delete action
  activeItem: Test2 | Record<string, never> // Test2 for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}