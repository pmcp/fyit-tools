import { z } from 'zod'

export const posClientSchema = z.object({
  eventId: z.number().min(1, 'eventId is required'),
  name: z.string().min(1, 'name is required'),
  email: z.string().optional(),
  notes: z.string().optional(),
  active: z.boolean().optional(),
  description: z.string().optional(),
  isGlobal: z.boolean().optional()
})

export const posClientsColumns = [
  { accessorKey: 'eventId', header: 'EventId' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'notes', header: 'Notes' },
  { accessorKey: 'active', header: 'Active' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'isGlobal', header: 'IsGlobal' },
  { accessorKey: 'actions', header: 'Actions' }
]

export const posClientsConfig = {
  name: 'posClients',
  apiPath: 'pos-clients',
  componentName: 'PosClientsForm',
  schema: posClientSchema,
  defaultValues: {
    eventId: 0,
    name: '',
    email: '',
    notes: '',
    active: false,
    description: '',
    isGlobal: false
  },
  columns: posClientsColumns,
}

export const usePosClients = () => posClientsConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posClientsConfig.defaultValues,
    schema: posClientsConfig.schema,
    columns: posClientsConfig.columns
  }
}