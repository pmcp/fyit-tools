import { z } from 'zod'

export const posEventSchema = z.object({
  name: z.string().min(1, 'name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  eventType: z.string().optional(),
  status: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isActive: z.boolean().optional(),
  isCurrent: z.boolean().optional(),
  archivedAt: z.date().optional(),
  parentEventId: z.number().optional(),
  metadata: z.object({}).optional()
})

export const posEventsColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'eventType', header: 'EventType' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'startDate', header: 'StartDate' },
  { accessorKey: 'endDate', header: 'EndDate' },
  { accessorKey: 'isActive', header: 'IsActive' },
  { accessorKey: 'isCurrent', header: 'IsCurrent' },
  { accessorKey: 'archivedAt', header: 'ArchivedAt' },
  { accessorKey: 'parentEventId', header: 'ParentEventId' },
  { accessorKey: 'metadata', header: 'Metadata' },
  { accessorKey: 'actions', header: 'Actions' }
]

export const posEventsConfig = {
  name: 'posEvents',
  apiPath: 'pos-events',
  componentName: 'PosEventsForm',
  schema: posEventSchema,
  defaultValues: {
    name: '',
    slug: '',
    description: '',
    eventType: '',
    status: '',
    startDate: new Date(),
    endDate: new Date(),
    isActive: false,
    isCurrent: false,
    archivedAt: new Date(),
    parentEventId: 0,
    metadata: {}
  },
  columns: posEventsColumns,
}

export const usePosEvents = () => posEventsConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posEventsConfig.defaultValues,
    schema: posEventsConfig.schema,
    columns: posEventsConfig.columns
  }
}