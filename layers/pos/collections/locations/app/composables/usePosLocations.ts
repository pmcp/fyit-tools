import { z } from 'zod'

export const posLocationSchema = z.object({
  eventId: z.number().min(1, 'eventId is required'),
  name: z.string().min(1, 'name is required'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  printerMode: z.string().optional(),
  maxRetryAttempts: z.number().optional()
})

export const posLocationsColumns = [
  { accessorKey: 'eventId', header: 'EventId' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'isActive', header: 'IsActive' },
  { accessorKey: 'printerMode', header: 'PrinterMode' },
  { accessorKey: 'maxRetryAttempts', header: 'MaxRetryAttempts' },
  { accessorKey: 'actions', header: 'Actions' }
]

export const posLocationsConfig = {
  name: 'posLocations',
  apiPath: 'pos-locations',
  componentName: 'PosLocationsForm',
  schema: posLocationSchema,
  defaultValues: {
    eventId: 0,
    name: '',
    description: '',
    isActive: false,
    printerMode: '',
    maxRetryAttempts: 0
  },
  columns: posLocationsColumns,
}

export const usePosLocations = () => posLocationsConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posLocationsConfig.defaultValues,
    schema: posLocationsConfig.schema,
    columns: posLocationsConfig.columns
  }
}