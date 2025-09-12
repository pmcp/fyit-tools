import type { z } from 'zod'
import type { translationsUiSchema } from './app/composables/useTranslationsUi'

export interface TranslationsUi {
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

export type TranslationsUiFormData = z.infer<typeof translationsUiSchema>
export type NewTranslationsUi = Omit<TranslationsUi, 'id' | 'createdAt' | 'updatedAt'>

// Props type for the Form component
export interface TranslationsUiFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: TranslationsUi | Record<string, never> // TranslationsUi for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}