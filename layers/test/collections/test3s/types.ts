import type { z } from 'zod'
import type { test3Schema } from './app/composables/useTest3s'

export interface Test3 {
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

export type Test3FormData = z.infer<typeof test3Schema>
export type NewTest3 = Omit<Test3, 'id' | 'createdAt' | 'updatedAt'>

// Props type for the Form component
export interface Test3FormProps {
  items: string[] // Array of IDs for delete action
  activeItem: Test3 | Record<string, never> // Test3 for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}