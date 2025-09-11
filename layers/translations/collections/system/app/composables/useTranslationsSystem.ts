import { z } from 'zod'

export const translationsSystemSchema = z.object({
  keyPath: z.string().min(1, 'keyPath is required'),
  category: z.string().min(1, 'category is required'),
  values: z.record(z.string()),
  description: z.string().optional()
})

export const translationsSystemColumns = [
  { accessorKey: 'keyPath', header: 'KeyPath' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'values', header: 'Values' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'actions', header: 'Actions' }
]

export const translationsSystemConfig = {
  name: 'translationsSystem',
  apiPath: 'translations-workspace',
  componentName: 'TranslationsSystemForm',
  schema: translationsSystemSchema,
  defaultValues: {
    keyPath: '',
    category: '',
    values: {},
    description: ''
  },
  columns: translationsSystemColumns,
}

export const useTranslationsSystem = () => translationsSystemConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: translationsSystemConfig.defaultValues,
    schema: translationsSystemConfig.schema,
    columns: translationsSystemConfig.columns
  }
}