import { z } from 'zod'

export const workSchema = z.object({
  name: z.string().min(1, 'name is required'),
  description: z.string().optional()
})

export const worksColumns = [
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description' }
]

export const worksConfig = {
  name: 'works',
  apiPath: 'works',
  componentName: 'WorkForm',
  schema: workSchema,
  defaultValues: {
    name: '',
    description: ''
  },
  columns: worksColumns,
}

export const useWorks = () => worksConfig