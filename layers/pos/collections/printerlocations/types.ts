import type { z } from 'zod'
import type { posPrinterLocationSchema } from './app/composables/usePosPrinterLocations'

export interface PosPrinterLocation {
  id: string
  teamId: string
  userId: string
  printerId: number
  locationId: number
  createdAt: Date
  updatedAt: Date
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosPrinterLocationFormData = z.infer<typeof posPrinterLocationSchema>
export type NewPosPrinterLocation = Omit<PosPrinterLocation, 'id' | 'createdAt' | 'updatedAt'>

// Props type for the Form component
export interface PosPrinterLocationFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosPrinterLocation | Record<string, never> // PosPrinterLocation for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}