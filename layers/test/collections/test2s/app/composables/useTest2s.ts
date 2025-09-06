import { z } from 'zod'

export const test2Schema = z.object({
  name: z.string().min(1, 'name is required'),
  description: z.string().optional()
})

export const test2sColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'actions', header: 'Actions' }
]

export const test2sConfig = {
  name: 'test2s',
  apiPath: 'test2s',
  componentName: 'Test2sForm',
  schema: test2Schema,
  defaultValues: {
    name: '',
    description: ''
  },
  columns: test2sColumns,
}

export const useTest2s = () => test2sConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: test2sConfig.defaultValues,
    schema: test2sConfig.schema,
    columns: test2sConfig.columns
  }
}