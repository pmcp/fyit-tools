import { z } from 'zod'

export const posProductSchema = z.object({
  eventId: z.number().min(1, 'eventId is required'),
  categoryId: z.number().optional(),
  locationId: z.number().optional(),
  name: z.string().min(1, 'name is required'),
  description: z.string().optional(),
  price: z.number().optional(),
  isActive: z.boolean().optional(),
  isTemplate: z.boolean().optional(),
  requiresRemark: z.boolean().optional(),
  remarkPrompt: z.string().optional(),
  sortOrder: z.number().optional()
})

export const posProductsColumns = [
  { accessorKey: 'eventId', header: 'EventId' },
  { accessorKey: 'categoryId', header: 'CategoryId' },
  { accessorKey: 'locationId', header: 'LocationId' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'price', header: 'Price' },
  { accessorKey: 'isActive', header: 'IsActive' },
  { accessorKey: 'isTemplate', header: 'IsTemplate' },
  { accessorKey: 'requiresRemark', header: 'RequiresRemark' },
  { accessorKey: 'remarkPrompt', header: 'RemarkPrompt' },
  { accessorKey: 'sortOrder', header: 'SortOrder' },
  { accessorKey: 'actions', header: 'Actions' }
]

export const posProductsConfig = {
  name: 'posProducts',
  apiPath: 'pos-products',
  componentName: 'PosProductsForm',
  schema: posProductSchema,
  defaultValues: {
    eventId: 0,
    categoryId: 0,
    locationId: 0,
    name: '',
    description: '',
    price: 0,
    isActive: false,
    isTemplate: false,
    requiresRemark: false,
    remarkPrompt: '',
    sortOrder: 0
  },
  columns: posProductsColumns,
}

export const usePosProducts = () => posProductsConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posProductsConfig.defaultValues,
    schema: posProductsConfig.schema,
    columns: posProductsConfig.columns
  }
}