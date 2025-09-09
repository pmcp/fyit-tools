import type { z } from 'zod'
import type { posSystemLogSchema } from './app/composables/usePosSystemLogs'

export interface PosSystemLog {
  id: string
  teamId: string
  userId: string
  logType?: string
  message?: string
  metadata?: Record<string, any>
  eventId?: number
  createdAt: Date
  updatedAt: Date
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosSystemLogFormData = z.infer<typeof posSystemLogSchema>
export type NewPosSystemLog = Omit<PosSystemLog, 'id' | 'createdAt' | 'updatedAt'>

// Props type for the Form component
export interface PosSystemLogFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosSystemLog | Record<string, never> // PosSystemLog for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}