import { z } from 'zod'

export const posPrinterSchema = z.object({
  eventId: z.number().min(1, 'eventId is required'),
  name: z.string().min(1, 'name is required'),
  ipAddress: z.string().optional(),
  port: z.number().optional(),
  status: z.number().optional(),
  showPrices: z.boolean().optional(),
  locationId: z.number().optional(),
  priority: z.number().optional(),
  healthStatus: z.string().optional(),
  lastSuccessAt: z.date().optional(),
  lastFailureAt: z.date().optional(),
  consecutiveFailures: z.number().optional()
})

export const posPrintersColumns = [
  { accessorKey: 'eventId', header: 'EventId' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'ipAddress', header: 'IpAddress' },
  { accessorKey: 'port', header: 'Port' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'showPrices', header: 'ShowPrices' },
  { accessorKey: 'locationId', header: 'LocationId' },
  { accessorKey: 'priority', header: 'Priority' },
  { accessorKey: 'healthStatus', header: 'HealthStatus' },
  { accessorKey: 'lastSuccessAt', header: 'LastSuccessAt' },
  { accessorKey: 'lastFailureAt', header: 'LastFailureAt' },
  { accessorKey: 'consecutiveFailures', header: 'ConsecutiveFailures' },
  { accessorKey: 'actions', header: 'Actions' }
]

export const posPrintersConfig = {
  name: 'posPrinters',
  apiPath: 'pos-printers',
  componentName: 'PosPrintersForm',
  schema: posPrinterSchema,
  defaultValues: {
    eventId: 0,
    name: '',
    ipAddress: '',
    port: 0,
    status: 0,
    showPrices: false,
    locationId: 0,
    priority: 0,
    healthStatus: '',
    lastSuccessAt: new Date(),
    lastFailureAt: new Date(),
    consecutiveFailures: 0
  },
  columns: posPrintersColumns,
}

export const usePosPrinters = () => posPrintersConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posPrintersConfig.defaultValues,
    schema: posPrintersConfig.schema,
    columns: posPrintersConfig.columns
  }
}