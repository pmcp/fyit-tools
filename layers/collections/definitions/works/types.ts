import type { z } from 'zod'
import type { workSchema } from './app/composables/useWorks'

export interface Work {
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

export type WorkFormData = z.infer<typeof workSchema>
export type NewWork = Omit<Work, 'id' | 'createdAt' | 'updatedAt'>