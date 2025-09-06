import type { z } from 'zod'
import type { eventSchema } from './app/composables/useEvents'

export interface Event {
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

export type EventFormData = z.infer<typeof eventSchema>
export type NewEvent = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>