import type { z } from 'zod'
import type { posCategorieSchema } from './app/composables/usePosCategories'

export interface PosCategorie {
  id: string
  teamId: string
  userId: string
  eventId: number
  name: string
  color?: string
  icon?: string
  sortOrder?: number
  isActive?: boolean
  translations?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosCategorieFormData = z.infer<typeof posCategorieSchema>
export type NewPosCategorie = Omit<PosCategorie, 'id' | 'createdAt' | 'updatedAt'>
export type CreatePosCategorieInput = Partial<NewPosCategorie> & {
  id?: string  // Can be provided but will be excluded
  locale?: string
}

// Props type for the Form component
export interface PosCategorieFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosCategorie | Record<string, never> // PosCategorie for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}