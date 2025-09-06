import { z } from 'zod'

export const test4Schema = z.object({
  name: z.string().min(1, 'name is required'),
  description: z.string().optional()
})

export const test4sColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'actions', header: 'Actions' }
]

export const test4sConfig = {
  name: 'test4s',
  apiPath: 'test4s',
  componentName: 'Test4sForm',
  schema: test4Schema,
  defaultValues: {
    name: '',
    description: ''
  },
  columns: test4sColumns,
}

export const useTest4s = () => test4sConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: test4sConfig.defaultValues,
    schema: test4sConfig.schema,
    columns: test4sConfig.columns
  }
}