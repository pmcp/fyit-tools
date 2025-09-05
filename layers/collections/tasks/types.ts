import { z } from 'zod'
import { tasksConfig } from './composables/useTasks'

// Infer the type from the Zod schema for consistency
export type TaskFormData = z.infer<typeof tasksConfig.schema>

// Full Task type including system fields
export interface Task extends TaskFormData {
  id: string
  teamId: string
  userId: string
  createdAt?: string
  updatedAt?: string
  // Optimistic update fields
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

// Props type for the Form component
export interface TaskFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: Task | Record<string, never> // Task for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}