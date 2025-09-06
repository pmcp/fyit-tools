import { z } from 'zod'

export const eventSchema = z.object({
  name: z.string().min(1, 'name is required'),
  description: z.string().optional()
})

export const eventsColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'actions', header: 'Actions' }
]

export const eventsConfig = {
  name: 'events',
  apiPath: 'events',
  componentName: 'EventsForm',
  schema: eventSchema,
  defaultValues: {
    name: '',
    description: ''
  },
  columns: eventsColumns,
}

export const useEvents = () => eventsConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: eventsConfig.defaultValues,
    schema: eventsConfig.schema,
    columns: eventsConfig.columns
  }
}