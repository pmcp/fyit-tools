import { z } from 'zod'

export const workSchema = z.object({
  name: z.string().min(1, 'name is required'),
  description: z.string().optional()
})

export const worksColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'actions', header: 'Actions' }
]

export const worksConfig = {
  name: 'works',
  apiPath: 'works',
  componentName: 'WorksForm',
  schema: workSchema,
  defaultValues: {
    name: '',
    description: ''
  },
  columns: worksColumns,
}

export const useWorks = () => worksConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: worksConfig.defaultValues,
    schema: worksConfig.schema,
    columns: worksConfig.columns
  }
}