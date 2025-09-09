import type { z } from 'zod'
import type { posEventSchema } from './app/composables/usePosEvents'

export interface PosEvent {
  id: string
  teamId: string
  userId: string
  name: string
  slug?: string
  description?: string
  eventType?: string
  status?: string
  startDate?: Date
  endDate?: Date
  isActive?: boolean
  isCurrent?: boolean
  archivedAt?: Date
  parentEventId?: number
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosEventFormData = z.infer<typeof posEventSchema>
export type NewPosEvent = Omit<PosEvent, 'id' | 'createdAt' | 'updatedAt'>

// Props type for the Form component
export interface PosEventFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosEvent | Record<string, never> // PosEvent for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}