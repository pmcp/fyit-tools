import { z } from 'zod'

// Schema for validation
export const translationsUiSchema = z.object({
  keyPath: z.string().min(1, 'keyPath is required'),
  category: z.string().min(1, 'category is required'),
  values: z.record(z.string()).refine(
    (values) => values.en && values.en.trim() !== '',
    { message: 'English translation is required' }
  ),
  description: z.string().nullable().optional().default(''),
  isOverrideable: z.boolean().optional()
})

// Table columns configuration
export const TRANSLATION_UI_COLUMNS = [
  { accessorKey: 'keyPath', header: 'KeyPath' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'values', header: 'Values' },
  { accessorKey: 'isOverrideable', header: 'Overrideable' },
  { accessorKey: 'overrideCount', header: 'Overrides' },
  { accessorKey: 'description', header: 'Description' },
]

// Default values for forms
export const TRANSLATION_UI_DEFAULTS = {
  keyPath: '',
  category: '',
  values: { en: '' },
  description: '',
  isOverrideable: true
}

// Default pagination settings
export const TRANSLATION_UI_PAGINATION = {
  currentPage: 1,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'desc' as const
}

// Collection configuration for CRUD system
export const translationsUiConfig = {
  name: 'translationsUi',
  apiPath: 'translations-ui',
  componentName: 'TranslationsUiForm',
  schema: translationsUiSchema,
  defaultValues: TRANSLATION_UI_DEFAULTS,
  columns: TRANSLATION_UI_COLUMNS,
  defaultPagination: TRANSLATION_UI_PAGINATION
}

// Simplified composable - just returns the constants
export const useTranslationsUi = () => ({
  schema: translationsUiSchema,
  columns: TRANSLATION_UI_COLUMNS,
  defaultValue: TRANSLATION_UI_DEFAULTS,
  defaultPagination: TRANSLATION_UI_PAGINATION,
  config: translationsUiConfig,
  collection: 'translationsUi'
})

// Default export for auto-import compatibility
export default useTranslationsUi
