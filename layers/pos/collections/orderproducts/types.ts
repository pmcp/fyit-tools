import type { z } from 'zod'
import type { posOrderProductSchema } from './app/composables/usePosOrderProducts'

export interface PosOrderProduct {
  id: string
  teamId: string
  userId: string
  orderId: number
  productId: number
  quantity: number
  unitPrice?: number
  taxRate?: number
  discountAmount?: number
  totalAmount?: number
  notes?: string
  totalPrice?: number
  remarks?: string
  createdAt: Date
  updatedAt: Date
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosOrderProductFormData = z.infer<typeof posOrderProductSchema>
export type NewPosOrderProduct = Omit<PosOrderProduct, 'id' | 'createdAt' | 'updatedAt'>

// Props type for the Form component
export interface PosOrderProductFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosOrderProduct | Record<string, never> // PosOrderProduct for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}