import type { z } from 'zod'
import type { workSchema } from './app/composables/useWorks'

export interface Work {
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

export type WorkFormData = z.infer<typeof workSchema>
export type NewWork = Omit<Work, 'id' | 'createdAt' | 'updatedAt'>

// Props type for the Form component
export interface WorkFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: Work | Record<string, never> // Work for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}