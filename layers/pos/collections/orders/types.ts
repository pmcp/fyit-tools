import type { z } from 'zod'
import type { posOrderSchema } from './app/composables/usePosOrders'

export interface PosOrder {
  id: string
  teamId: string
  userId: string
  eventId: number
  clientId?: number
  locationId?: number
  orderNumber?: string
  status?: string
  paymentMethod?: string
  paymentStatus?: string
  subtotal?: number
  taxAmount?: number
  discountAmount?: number
  totalAmount?: number
  notes?: string
  metadata?: Record<string, any>
  completedAt?: Date
  eventOrderNumber?: number
  clientName?: string
  waiterId?: number
  personnel?: boolean
  overallRemarks?: string
  createdAt: Date
  updatedAt: Date
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosOrderFormData = z.infer<typeof posOrderSchema>
export type NewPosOrder = Omit<PosOrder, 'id' | 'createdAt' | 'updatedAt'>

// Props type for the Form component
export interface PosOrderFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosOrder | Record<string, never> // PosOrder for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}