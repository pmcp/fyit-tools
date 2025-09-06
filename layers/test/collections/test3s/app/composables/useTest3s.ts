import { z } from 'zod'

export const test3Schema = z.object({
  name: z.string().min(1, 'name is required'),
  description: z.string().optional()
})

export const test3sColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'actions', header: 'Actions' }
]

export const test3sConfig = {
  name: 'test3s',
  apiPath: 'test3s',
  componentName: 'Test3sForm',
  schema: test3Schema,
  defaultValues: {
    name: '',
    description: ''
  },
  columns: test3sColumns,
}

export const useTest3s = () => test3sConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: test3sConfig.defaultValues,
    schema: test3sConfig.schema,
    columns: test3sConfig.columns
  }
}