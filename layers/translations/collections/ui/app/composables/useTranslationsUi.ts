import { z } from 'zod'

export const translationsUiSchema = z.object({
  keyPath: z.string().min(1, 'keyPath is required'),
  category: z.string().min(1, 'category is required'),
  values: z.record(z.string()),
  description: z.string().optional(),
  isOverrideable: z.boolean().optional()
})

export const translationsUiColumns = [
  { accessorKey: 'keyPath', header: 'KeyPath' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'values', header: 'Values' },
  { accessorKey: 'isOverrideable', header: 'Overrideable' },
  { accessorKey: 'overrideCount', header: 'Overrides' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'actions', header: 'Actions' }
]

export const translationsUiConfig = {
  name: 'translationsUi',
  apiPath: 'translations-ui',
  componentName: 'TranslationsUiForm',
  schema: translationsUiSchema,
  defaultValues: {
    keyPath: '',
    category: '',
    values: {},
    description: '',
    isOverrideable: true
  },
  columns: translationsUiColumns,
}

export const useTranslationsUi = () => translationsUiConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: translationsUiConfig.defaultValues,
    schema: translationsUiConfig.schema,
    columns: translationsUiConfig.columns
  }
}
