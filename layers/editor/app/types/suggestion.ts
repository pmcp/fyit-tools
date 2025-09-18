export interface SuggestionItem {
  /** Unique identifier for the suggestion */
  id: string

  /** Display name of the suggestion */
  name: string

  /** Optional description or subtitle */
  description?: string

  /** Icon identifier (e.g., 'i-lucide-bold', 'i-lucide-italic') */
  icon: string

  /** Keyboard shortcut for the command */
  shortcut?: string

  /** Whether the suggestion is currently active/selected */
  isActive?: boolean

  /** Whether the suggestion is disabled */
  disabled?: boolean

  /** Command type/category for grouping */
  type?: 'format' | 'insert' | 'edit' | 'navigation'

  /** Additional command-specific data */
  data?: Record<string, any>
}