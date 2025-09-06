import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, 'name is required'),
  description: z.string().optional()
})

export const productsColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'actions', header: 'Actions' }
]

export const productsConfig = {
  name: 'products',
  apiPath: 'products',
  componentName: 'ProductsForm',
  schema: productSchema,
  defaultValues: {
    name: '',
    description: ''
  },
  columns: productsColumns,
}

export const useProducts = () => productsConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: productsConfig.defaultValues,
    schema: productsConfig.schema,
    columns: productsConfig.columns
  }
}