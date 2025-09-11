import type { z } from 'zod'
import type { translationsSystemSchema } from './app/composables/useTranslationsSystem'

export interface TranslationsSystem {
  id: string
  teamId: string
  userId: string
  keyPath: string
  category: string
  values: Record<string, any>
  description?: string
  createdAt: Date
  updatedAt: Date
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type TranslationsSystemFormData = z.infer<typeof translationsSystemSchema>
export type NewTranslationsSystem = Omit<TranslationsSystem, 'id' | 'createdAt' | 'updatedAt'>

// Props type for the Form component
export interface TranslationsSystemFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: TranslationsSystem | Record<string, never> // TranslationsSystem for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}