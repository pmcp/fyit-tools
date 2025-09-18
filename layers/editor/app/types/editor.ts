import type { Editor } from '@tiptap/vue-3'

export interface TranslationUpdate {
  key: string
  value: string
  locale: string
  timestamp: number
}

export interface EditorLanguage {
  code: string
  name: string
  flag?: string
  isRTL?: boolean
}

export interface EditorDiff {
  id: string
  type: 'added' | 'removed' | 'modified'
  position: {
    top: string
    left: string
    width: string
    height: string
  }
  content: string
}

export interface EditorState {
  leftEditor: Editor | null
  rightEditor: Editor | null
  leftLanguage: string
  rightLanguage: string
  syncEnabled: boolean
  diffHighlights: EditorDiff[]
  isLoading: boolean
  hasChanges: boolean
}

export interface EditorTranslationsProps {
  /** Translation data keyed by language code */
  translations: Record<string, string>

  /** Available languages for selection */
  languages: EditorLanguage[]

  /** Current translation key being edited */
  translationKey?: string

  /** Translation mode */
  mode?: 'team' | 'system'

  /** Read-only state */
  readonly?: boolean

  /** Initial left pane language */
  initialLeftLanguage?: string

  /** Initial right pane language */
  initialRightLanguage?: string

  /** Enable/disable real-time sync between panes */
  enableSync?: boolean

  /** Show diff highlights */
  showDiff?: boolean

  /** Editor placeholder text */
  placeholder?: string

  /** Maximum character count */
  maxLength?: number
}

export interface EditorTranslationsEmits {
  /** Emitted when translation content is updated */
  'translation:updated': [update: TranslationUpdate]

  /** Emitted when translations are saved */
  'translation:saved': [result: { success: boolean; errors?: string[] }]

  /** Emitted when editor is ready */
  'editor:ready': [editors: { left: Editor; right: Editor }]

  /** Emitted when language selection changes */
  'language:changed': [selection: { left: string; right: string }]

  /** Emitted when sync state changes */
  'sync:toggled': [enabled: boolean]

  /** Emitted when editor gains/loses focus */
  'editor:focus': [pane: 'left' | 'right']

  /** Emitted when editor content has unsaved changes */
  'changes:detected': [hasChanges: boolean]
}

export interface EditorLayoutConfig {
  /** Desktop layout: 'split' | 'tabs' */
  desktop: 'split' | 'tabs'

  /** Tablet layout: 'split' | 'tabs' | 'stack' */
  tablet: 'split' | 'tabs' | 'stack'

  /** Mobile layout: 'tabs' | 'stack' | 'swipe' */
  mobile: 'tabs' | 'stack' | 'swipe'

  /** Enable resizable panes */
  resizable: boolean

  /** Initial pane split ratio (0-1) */
  splitRatio: number
}

export interface EditorSyncOptions {
  /** Debounce delay for sync operations (ms) */
  debounceDelay: number

  /** Enable bidirectional sync */
  bidirectional: boolean

  /** Sync cursor position */
  syncCursor: boolean

  /** Sync scroll position */
  syncScroll: boolean
}
