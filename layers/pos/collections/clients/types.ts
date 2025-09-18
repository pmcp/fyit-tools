import type { z } from 'zod'
import type { posClientSchema } from './app/composables/usePosClients'

export interface PosClient {
  id: string
  teamId: string
  userId: string
  eventId: number
  name: string
  email?: string
  notes?: string
  active?: boolean
  description?: string
  isGlobal?: boolean
  translations?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosClientFormData = z.infer<typeof posClientSchema>
export type NewPosClient = Omit<PosClient, 'id' | 'createdAt' | 'updatedAt'>
export type CreatePosClientInput = Partial<NewPosClient> & {
  id?: string  // Can be provided but will be excluded
  locale?: string
}

// Props type for the Form component
export interface PosClientFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosClient | Record<string, never> // PosClient for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}