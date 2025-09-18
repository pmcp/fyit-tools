import type { z } from 'zod'
import type { posLocationSchema } from './app/composables/usePosLocations'

export interface PosLocation {
  id: string
  teamId: string
  userId: string
  eventId: number
  name: string
  description?: string
  isActive?: boolean
  printerMode?: string
  maxRetryAttempts?: number
  translations?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosLocationFormData = z.infer<typeof posLocationSchema>
export type NewPosLocation = Omit<PosLocation, 'id' | 'createdAt' | 'updatedAt'>
export type CreatePosLocationInput = Partial<NewPosLocation> & {
  id?: string  // Can be provided but will be excluded
  locale?: string
}

// Props type for the Form component
export interface PosLocationFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosLocation | Record<string, never> // PosLocation for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}