import { z } from 'zod'

export const itemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'name is required'),
  price: z.number().min(1, 'price is required'),
  inStock: z.boolean().optional()
})

export const itemsColumns = [
  { accessorKey: 'id', header: 'Id' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'price', header: 'Price' },
  { accessorKey: 'inStock', header: 'InStock' },
  { accessorKey: 'actions', header: 'Actions' }
]

export const itemsConfig = {
  name: 'items',
  componentName: 'ItemsForm',
  singular: 'item',
  plural: 'items',
  pascalCase: 'Item',
  pascalCasePlural: 'Items'
}

export default function useItems() {
  const collections = useCollections()
  
  return {
    items: collections.items,
    schema: itemSchema,
    columns: itemsColumns,
    config: itemsConfig
  }
}