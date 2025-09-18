import type { z } from 'zod'
import type { posProductSchema } from './app/composables/usePosProducts'

export interface PosProduct {
  id: string
  teamId: string
  userId: string
  eventId: number
  categoryId?: number
  locationId?: number
  name: string
  description?: string
  price?: number
  isActive?: boolean
  isTemplate?: boolean
  requiresRemark?: boolean
  remarkPrompt?: string
  sortOrder?: number
  translations?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosProductFormData = z.infer<typeof posProductSchema>
export type NewPosProduct = Omit<PosProduct, 'id' | 'createdAt' | 'updatedAt'>
export type CreatePosProductInput = Partial<NewPosProduct> & {
  id?: string  // Can be provided but will be excluded
  locale?: string
}

// Props type for the Form component
export interface PosProductFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosProduct | Record<string, never> // PosProduct for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}