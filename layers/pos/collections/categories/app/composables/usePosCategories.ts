import { z } from 'zod'

export const posCategorieSchema = z.object({
  eventId: z.number().min(1, 'eventId is required'),
  name: z.string().min(1, 'name is required'),
  color: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional()
})

export const posCategoriesColumns = [
  { accessorKey: 'eventId', header: 'EventId' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'color', header: 'Color' },
  { accessorKey: 'icon', header: 'Icon' },
  { accessorKey: 'sortOrder', header: 'SortOrder' },
  { accessorKey: 'isActive', header: 'IsActive' },
  { accessorKey: 'actions', header: 'Actions' }
]

export const posCategoriesConfig = {
  name: 'posCategories',
  apiPath: 'pos-categories',
  componentName: 'PosCategoriesForm',
  schema: posCategorieSchema,
  defaultValues: {
    eventId: 0,
    name: '',
    color: '',
    icon: '',
    sortOrder: 0,
    isActive: false
  },
  columns: posCategoriesColumns,
}

export const usePosCategories = () => posCategoriesConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posCategoriesConfig.defaultValues,
    schema: posCategoriesConfig.schema,
    columns: posCategoriesConfig.columns
  }
}