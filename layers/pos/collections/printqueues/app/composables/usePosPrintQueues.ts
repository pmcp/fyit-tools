import { z } from 'zod'

export const posPrintQueueSchema = z.object({
  orderId: z.number().min(1, 'orderId is required'),
  locationId: z.number().optional(),
  printerId: z.number().optional(),
  status: z.string().optional(),
  items: z.object({}).optional(),
  total: z.number().optional(),
  printMode: z.string().optional(),
  isDuplicateOf: z.number().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  errorMessage: z.string().optional(),
  retryCount: z.number().optional(),
  eventId: z.number().optional(),
  printData: z.string().optional()
})

export const posPrintQueuesColumns = [
  { accessorKey: 'orderId', header: 'OrderId' },
  { accessorKey: 'locationId', header: 'LocationId' },
  { accessorKey: 'printerId', header: 'PrinterId' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'items', header: 'Items' },
  { accessorKey: 'total', header: 'Total' },
  { accessorKey: 'printMode', header: 'PrintMode' },
  { accessorKey: 'isDuplicateOf', header: 'IsDuplicateOf' },
  { accessorKey: 'startedAt', header: 'StartedAt' },
  { accessorKey: 'completedAt', header: 'CompletedAt' },
  { accessorKey: 'errorMessage', header: 'ErrorMessage' },
  { accessorKey: 'retryCount', header: 'RetryCount' },
  { accessorKey: 'eventId', header: 'EventId' },
  { accessorKey: 'printData', header: 'PrintData' },
  { accessorKey: 'actions', header: 'Actions' }
]

export const posPrintQueuesConfig = {
  name: 'posPrintQueues',
  apiPath: 'pos-printqueues',
  componentName: 'PosPrintQueuesForm',
  schema: posPrintQueueSchema,
  defaultValues: {
    orderId: 0,
    locationId: 0,
    printerId: 0,
    status: '',
    items: {},
    total: 0,
    printMode: '',
    isDuplicateOf: 0,
    startedAt: new Date(),
    completedAt: new Date(),
    errorMessage: '',
    retryCount: 0,
    eventId: 0,
    printData: ''
  },
  columns: posPrintQueuesColumns,
}

export const usePosPrintQueues = () => posPrintQueuesConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posPrintQueuesConfig.defaultValues,
    schema: posPrintQueuesConfig.schema,
    columns: posPrintQueuesConfig.columns
  }
}