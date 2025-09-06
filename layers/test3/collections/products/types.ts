import type { z } from 'zod'
import type { productSchema } from './app/composables/useProducts'

export interface Product {
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

export type ProductFormData = z.infer<typeof productSchema>
export type NewProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

// Props type for the Form component
export interface ProductFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: Product | Record<string, never> // Product for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}