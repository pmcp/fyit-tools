# 🎨 Editor Layer - Dual-Pane Tiptap Translation Editor

A powerful, responsive dual-pane translation editor built with Tiptap and Nuxt UI 4. Perfect for creating engaging translation workflows with real-time sync, diff highlighting, and mobile-optimized experiences.

## ✨ Features

### 🔄 **Dual-Pane Editing**
- Side-by-side editors for source and target languages
- Real-time synchronization between panes
- Resizable panes with keyboard shortcuts
- Visual diff highlighting

### 🌐 **Language Management**
- Dynamic language selector with flag icons
- Quick language pair switching
- Recent language combinations memory
- RTL language support

### 📱 **Responsive Design**
- **Desktop**: Side-by-side split panes
- **Tablet**: Tabbed interface or split view
- **Mobile**: Stacked layout with swipe gestures
- Auto-adaptive based on screen size

### ⚡ **Performance & UX**
- Client-side rendering with SSR fallback
- Optimistic updates with auto-save
- Debounced diff calculations
- Keyboard shortcuts for power users

## 🚀 Quick Start

### 1. Installation

The editor layer is already included in your Nuxt layers. Dependencies are automatically installed.

### 2. Basic Usage

```vue
<template>
  <TiptapTranslationEditor
    :translations="translations"
    :languages="availableLanguages"
    :translation-key="currentKey"
    @translation:updated="handleUpdate"
    @translation:saved="handleSave"
  />
</template>

<script setup>
const translations = ref({
  en: 'Hello world',
  nl: 'Hallo wereld',
  fr: 'Bonjour le monde'
})

const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
]

const handleUpdate = (update) => {
  // Handle translation updates
  translations.value[update.locale] = update.value
}

const handleSave = (result) => {
  // Handle save completion
  console.log('Save result:', result)
}
</script>
```

### 3. Advanced Configuration

```vue
<template>
  <TiptapTranslationEditor
    :translations="translations"
    :languages="languages"
    :translation-key="translationKey"
    :mode="mode"
    :readonly="readonly"
    :initial-left-language="'en'"
    :initial-right-language="'nl'"
    :enable-sync="true"
    :show-diff="true"
    :placeholder="'Enter your translation...'"
    :max-length="500"
    @translation:updated="handleTranslationUpdate"
    @translation:saved="handleTranslationSave"
    @editor:ready="handleEditorsReady"
    @language:changed="handleLanguageChange"
    @sync:toggled="handleSyncToggle"
  />
</template>
```

## 📚 API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `translations` | `Record<string, string>` | `{}` | Translation data keyed by language code |
| `languages` | `EditorLanguage[]` | `[]` | Available languages for selection |
| `translationKey` | `string` | `undefined` | Current translation key being edited |
| `mode` | `'team' \| 'system'` | `'team'` | Translation mode |
| `readonly` | `boolean` | `false` | Read-only state |
| `initialLeftLanguage` | `string` | `'en'` | Initial left pane language |
| `initialRightLanguage` | `string` | `'nl'` | Initial right pane language |
| `enableSync` | `boolean` | `true` | Enable real-time sync between panes |
| `showDiff` | `boolean` | `false` | Show diff highlights |
| `placeholder` | `string` | `'Start typing...'` | Editor placeholder text |
| `maxLength` | `number` | `undefined` | Maximum character count |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `translation:updated` | `TranslationUpdate` | Emitted when translation content changes |
| `translation:saved` | `{ success: boolean, errors?: string[] }` | Emitted when translations are saved |
| `editor:ready` | `{ left: Editor, right: Editor }` | Emitted when editors are initialized |
| `language:changed` | `{ left: string, right: string }` | Emitted when language selection changes |
| `sync:toggled` | `boolean` | Emitted when sync state changes |

### Types

```typescript
interface EditorLanguage {
  code: string
  name: string
  flag?: string
  isRTL?: boolean
}

interface TranslationUpdate {
  key: string
  value: string
  locale: string
  timestamp: number
}
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Shift + S` | Swap languages |
| `Cmd/Ctrl + [` | Switch to left tab |
| `Cmd/Ctrl + ]` | Switch to right tab |
| `Cmd/Ctrl + Shift + D` | Toggle diff highlighting |
| `Cmd/Ctrl + R` | Reset pane split to 50/50 |
| `Arrow Keys` | Resize panes (when focused) |
| `Space/Enter` | Reset split ratio (on resize handle) |
| `Escape` | Close language selector |

## 🎨 Customization

### CSS Classes

The editor provides CSS classes for custom styling:

```css
.tiptap-editor { /* Main container */ }
.tiptap-editor__header { /* Top bar */ }
.tiptap-editor__content { /* Editor content area */ }
.tiptap-editor__footer { /* Status bar */ }

.editor-pane { /* Individual editor pane */ }
.editor-pane--focused { /* Focused pane */ }

.language-selector { /* Language picker */ }
.diff-highlight { /* Diff highlight overlay */ }
.diff-highlight--added { /* Added content */ }
.diff-highlight--removed { /* Removed content */ }
.diff-highlight--modified { /* Modified content */ }
```

### Layout Customization

```javascript
// Custom layout configuration
const layoutConfig = {
  desktop: 'split',  // 'split' | 'tabs'
  tablet: 'tabs',    // 'split' | 'tabs' | 'stack'
  mobile: 'stack',   // 'tabs' | 'stack' | 'swipe'
  resizable: true,
  splitRatio: 0.6    // 60/40 split
}
```

## 🔧 Composables

The layer provides several composables for advanced use cases:

### `useTranslationEditorState()`

Central state management for the editor.

```javascript
const {
  state,
  translations,
  setLeftLanguage,
  setRightLanguage,
  swapLanguages,
  updateTranslation
} = useTranslationEditorState()
```

### `useEditorSync()`

Handles synchronization between editor panes.

```javascript
const {
  setupSync,
  manualSync,
  areInSync
} = useEditorSync()
```

### `useEditorDiff()`

Manages diff calculation and highlighting.

```javascript
const {
  diffHighlights,
  updateDiff,
  getDiffStats
} = useEditorDiff()
```

### `useEditorLayout()`

Controls responsive layout behavior.

```javascript
const {
  currentLayout,
  isMobile,
  switchTab,
  setSplitRatio
} = useEditorLayout()
```

## 🧪 Integration Examples

### With Existing Translation Forms

```vue
<template>
  <UForm @submit="handleSubmit">
    <!-- Existing form fields -->
    <UFormField label="Translation Content" name="values">
      <TiptapTranslationEditor
        v-model:translations="formData.values"
        :languages="supportedLanguages"
        :translation-key="formData.keyPath"
        @translation:updated="markFormDirty"
      />
    </UFormField>

    <!-- Other form fields -->
    <UButton type="submit">Save Translation</UButton>
  </UForm>
</template>
```

### As a Standalone Component

```vue
<template>
  <div class="h-screen">
    <TiptapTranslationEditor
      :translations="currentTranslations"
      :languages="allLanguages"
      :readonly="!canEdit"
      class="h-full"
    />
  </div>
</template>
```

### With Custom Language Sets

```vue
<script setup>
const customLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', isRTL: false },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', isRTL: true },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
]
</script>
```

## 🚀 Performance Tips

1. **Debounced Updates**: The editor automatically debounces content updates to prevent excessive API calls.

2. **Virtual Scrolling**: For very long content, consider implementing virtual scrolling.

3. **Lazy Loading**: The editor uses `<ClientOnly>` for SSR compatibility.

4. **Memory Management**: Editors are automatically cleaned up on component unmount.

## 🔍 Troubleshooting

### Common Issues

**Editor not rendering**: Ensure you're using `<ClientOnly>` wrapper if rendering server-side.

**Sync not working**: Check that both editors are fully initialized before enabling sync.

**Layout issues on mobile**: Verify responsive layout configuration and CSS viewport settings.

**Performance with large content**: Consider implementing pagination or virtual scrolling.

### Debug Mode

Enable debug logging:

```javascript
// In development
if (process.dev) {
  console.log('Editor state:', editorState)
}
```

## 🤝 Contributing

This editor layer is part of the FYIT Tools project. For contributions:

1. Ensure all changes are within the `layers/editor/` directory
2. Follow the existing TypeScript and Vue patterns
3. Add appropriate tests for new features
4. Update documentation for API changes

## 📄 License

MIT License - see the project root for details.

---

**Built with ❤️ using Nuxt UI 4, Tiptap, and VueUse**