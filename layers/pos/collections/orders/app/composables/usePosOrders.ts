import { z } from 'zod'

export const posOrderSchema = z.object({
  eventId: z.number().min(1, 'eventId is required'),
  clientId: z.number().optional(),
  locationId: z.number().optional(),
  orderNumber: z.string().optional(),
  status: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentStatus: z.string().optional(),
  subtotal: z.number().optional(),
  taxAmount: z.number().optional(),
  discountAmount: z.number().optional(),
  totalAmount: z.number().optional(),
  notes: z.string().optional(),
  metadata: z.object({}).optional(),
  completedAt: z.date().optional(),
  eventOrderNumber: z.number().optional(),
  clientName: z.string().optional(),
  waiterId: z.number().optional(),
  personnel: z.boolean().optional(),
  overallRemarks: z.string().optional()
})

export const posOrdersColumns = [
  { accessorKey: 'eventId', header: 'EventId' },
  { accessorKey: 'clientId', header: 'ClientId' },
  { accessorKey: 'locationId', header: 'LocationId' },
  { accessorKey: 'orderNumber', header: 'OrderNumber' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'paymentMethod', header: 'PaymentMethod' },
  { accessorKey: 'paymentStatus', header: 'PaymentStatus' },
  { accessorKey: 'subtotal', header: 'Subtotal' },
  { accessorKey: 'taxAmount', header: 'TaxAmount' },
  { accessorKey: 'discountAmount', header: 'DiscountAmount' },
  { accessorKey: 'totalAmount', header: 'TotalAmount' },
  { accessorKey: 'notes', header: 'Notes' },
  { accessorKey: 'metadata', header: 'Metadata' },
  { accessorKey: 'completedAt', header: 'CompletedAt' },
  { accessorKey: 'eventOrderNumber', header: 'EventOrderNumber' },
  { accessorKey: 'clientName', header: 'ClientName' },
  { accessorKey: 'waiterId', header: 'WaiterId' },
  { accessorKey: 'personnel', header: 'Personnel' },
  { accessorKey: 'overallRemarks', header: 'OverallRemarks' },
  { accessorKey: 'actions', header: 'Actions' }
]

export const posOrdersConfig = {
  name: 'posOrders',
  apiPath: 'pos-orders',
  componentName: 'PosOrdersForm',
  schema: posOrderSchema,
  defaultValues: {
    eventId: 0,
    clientId: 0,
    locationId: 0,
    orderNumber: '',
    status: '',
    paymentMethod: '',
    paymentStatus: '',
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
    notes: '',
    metadata: {},
    completedAt: new Date(),
    eventOrderNumber: 0,
    clientName: '',
    waiterId: 0,
    personnel: false,
    overallRemarks: ''
  },
  columns: posOrdersColumns,
}

export const usePosOrders = () => posOrdersConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posOrdersConfig.defaultValues,
    schema: posOrdersConfig.schema,
    columns: posOrdersConfig.columns
  }
}