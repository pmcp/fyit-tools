import type { z } from 'zod'
import type { posPrinterSchema } from './app/composables/usePosPrinters'

export interface PosPrinter {
  id: string
  teamId: string
  userId: string
  eventId: number
  name: string
  ipAddress?: string
  port?: number
  status?: number
  showPrices?: boolean
  locationId?: number
  priority?: number
  healthStatus?: string
  lastSuccessAt?: Date
  lastFailureAt?: Date
  consecutiveFailures?: number
  translations?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosPrinterFormData = z.infer<typeof posPrinterSchema>
export type NewPosPrinter = Omit<PosPrinter, 'id' | 'createdAt' | 'updatedAt'>
export type CreatePosPrinterInput = Partial<NewPosPrinter> & {
  id?: string  // Can be provided but will be excluded
  locale?: string
}

// Props type for the Form component
export interface PosPrinterFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosPrinter | Record<string, never> // PosPrinter for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}