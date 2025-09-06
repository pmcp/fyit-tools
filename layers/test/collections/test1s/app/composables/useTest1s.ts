import { z } from 'zod'

export const test1Schema = z.object({
  name: z.string().min(1, 'name is required'),
  description: z.string().optional()
})

export const test1sColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'actions', header: 'Actions' }
]

export const test1sConfig = {
  name: 'test1s',
  apiPath: 'test1s',
  componentName: 'Test1sForm',
  schema: test1Schema,
  defaultValues: {
    name: '',
    description: ''
  },
  columns: test1sColumns,
}

export const useTest1s = () => test1sConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: test1sConfig.defaultValues,
    schema: test1sConfig.schema,
    columns: test1sConfig.columns
  }
}