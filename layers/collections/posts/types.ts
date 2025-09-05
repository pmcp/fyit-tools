import { z } from 'zod'
import { postsConfig } from './composables/usePosts'

// Infer the type from the Zod schema for consistency
export type PostFormData = z.infer<typeof postsConfig.schema>

// Full Post type including system fields
export interface Post extends PostFormData {
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
export interface PostFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: Post | Record<string, never> // Post for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}