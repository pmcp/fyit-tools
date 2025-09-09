import type { z } from 'zod'
import type { posPrintQueueSchema } from './app/composables/usePosPrintQueues'

export interface PosPrintQueue {
  id: string
  teamId: string
  userId: string
  orderId: number
  locationId?: number
  printerId?: number
  status?: string
  items?: Record<string, any>
  total?: number
  printMode?: string
  isDuplicateOf?: number
  startedAt?: Date
  completedAt?: Date
  errorMessage?: string
  retryCount?: number
  eventId?: number
  printData?: string
  createdAt: Date
  updatedAt: Date
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosPrintQueueFormData = z.infer<typeof posPrintQueueSchema>
export type NewPosPrintQueue = Omit<PosPrintQueue, 'id' | 'createdAt' | 'updatedAt'>

// Props type for the Form component
export interface PosPrintQueueFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosPrintQueue | Record<string, never> // PosPrintQueue for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}