# In-Place Translation Editing System - Technical Briefing

## Overview

This document provides a comprehensive technical briefing for implementing an in-place translation editing system in a Nuxt 3 application. The system allows developers to click on any translatable text in development mode and edit it directly inline, with automatic database persistence and real-time updates.

## Architecture Overview

### Core Components Architecture

```
┌─────────────────────────────────────────┐
│            User Interface              │
├─────────────────────────────────────────┤
│  DevModeToggle     DevTranslationWrapper│
│  (Toggle UI)       (Edit Interface)     │
├─────────────────────────────────────────┤
│            Composable Layer            │
├─────────────────────────────────────────┤
│  useT() - Enhanced Translation Logic   │
│  - Missing detection                   │
│  - Team override handling              │
│  - VNode wrapping in dev mode          │
├─────────────────────────────────────────┤
│             API Layer                  │
├─────────────────────────────────────────┤
│  Team Translations  System Translations│
│  PATCH /api/teams/  PUT /api/super-admin│
├─────────────────────────────────────────┤
│            Database Layer              │
├─────────────────────────────────────────┤
│  translations_system  translations_ui  │
│  (System defaults)    (Team overrides) │
└─────────────────────────────────────────┘
```

## Component Deep Dive

### DevTranslationWrapper.vue

**Purpose**: Wraps translatable text with inline editing capabilities in development mode.

**Key Features**:
- Visual indicators for different translation states
- Inline editing with UInput component
- Automatic width calculation for editor
- Keyboard shortcut support (Enter/Escape)
- Toast notification feedback
- Missing translation detection

**Props Interface**:
```typescript
interface Props {
  translationKey: string    // e.g., 'common.save'
  mode?: 'system' | 'team'  // Translation context
  category?: string         // e.g., 'ui', 'marketing', 'email'
  currentValue?: string     // Current translation value
  isMissing?: boolean      // Whether translation is missing
}
```

**State Management**:
- Uses local reactive state for editing mode
- Integrates with global dev mode state via `useState`
- Manages editor dimensions and focus handling

**Visual States**:
1. **System Translation** (Blue dashed outline)
   - `outline: 1px dashed rgba(59, 130, 246, 0.3)`
   - Indicates base system translation
   
2. **Team Override** (Green dashed outline)
   - `outline: 1px dashed rgba(34, 197, 94, 0.4)`
   - Shows team-specific overrides
   
3. **Missing Translation** (Red pulsing outline)
   - `animation: pulse-missing 2s infinite`
   - Alerts to missing translations

### DevModeToggle.vue

**Purpose**: Global toggle for enabling/disabling dev mode translation editing.

**Features**:
- Floating action button (bottom-right)
- Info panel with usage instructions
- Visual legend for translation states
- Keyboard shortcut reference
- Global CSS class management

**State Management**:
```typescript
const devModeEnabled = useState('devMode.enabled', () => false)
```

**Global CSS Classes**:
- Adds `dev-mode-enabled` to `document.documentElement`
- Triggers global pulse animations
- Enhanced visual feedback when active

## Enhanced useT Composable

### Core Functions

#### 1. translate() - Main Translation Function
```typescript
function translate(key: string, options: TranslationOptions = {}): string | VNode
```

**Behavior**:
- **Development**: Returns VNode wrapped with DevTranslationWrapper
- **Production**: Returns plain string
- **Missing Detection**: Checks if i18n returns key (indicating missing translation)
- **Team Override Priority**: Team translations take precedence over system

#### 2. translateString() - String-Only Version
```typescript
function translateString(key: string, options: TranslationOptions = {}): string
```

**Use Cases**:
- Computed properties
- Meta tags
- Document titles
- Any context where VNode isn't supported

#### 3. translateContent() - Database Content Translation
```typescript
function translateContent(entity: any, field: string, preferredLocale?: string): string
```

**Features**:
- Multi-locale fallback chain
- Entity field translation
- Graceful degradation

#### 4. Utility Functions
- `hasTranslation(key)` - Check translation existence
- `getAvailableLocales(key)` - Get supported locales for key
- `getTranslationMeta(key)` - Detailed translation metadata

### Translation Resolution Logic

```typescript
// Resolution priority:
1. Team Override (if in team context)
2. System Translation
3. Fallback/Placeholder
4. Key itself (wrapped in brackets)
```

### Missing Translation Detection

```typescript
// i18n returns the key when translation is missing
const systemValue = t(key, params)
const isTranslationMissing = systemValue === key
```

## API Architecture

### Team Translation Endpoint
**Route**: `PATCH /api/teams/[teamSlug]/translations`

**Workflow**:
1. Validate team exists
2. Check for existing override
3. If `createIfNotExists` and no system translation exists:
   - Create system translation first
   - Sync to locale files
4. Create/update team override
5. Update team settings cache

**Request Body**:
```typescript
{
  keyPath: string           // 'common.save'
  values: Record<string, string>  // { en: 'Submit', nl: 'Versturen' }
  category?: string         // 'ui'
  createIfNotExists?: boolean
}
```

### System Translation Endpoint
**Route**: `PUT /api/super-admin/translations-system`

**Workflow**:
1. Check for existing system translation
2. Create or update translation
3. Sync to locale JSON files
4. Return creation status

**Auto-Creation Features**:
- Automatic system translation creation for missing keys
- Descriptive metadata generation
- Proper categorization

## Database Schema Requirements

### translations_system Table
```sql
CREATE TABLE translations_system (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  teamId TEXT,              -- NULL for system translations
  namespace TEXT NOT NULL DEFAULT 'system',
  keyPath TEXT NOT NULL,
  category TEXT NOT NULL,
  values TEXT NOT NULL,     -- JSON: {"en": "value", "nl": "waarde"}
  description TEXT,
  isOverrideable BOOLEAN NOT NULL DEFAULT true,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL,
  UNIQUE(teamId, namespace, keyPath)
);
```

### translations_ui Table
```sql
CREATE TABLE translations_ui (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  teamId TEXT,              -- NULL for system translations
  namespace TEXT NOT NULL DEFAULT 'ui',
  keyPath TEXT NOT NULL,
  category TEXT NOT NULL,
  values TEXT NOT NULL,     -- JSON: {"en": "value", "nl": "waarde"}
  description TEXT,
  isOverrideable BOOLEAN NOT NULL DEFAULT true,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL,
  UNIQUE(teamId, namespace, keyPath)
);
```

### Team Settings Integration
```sql
-- Team settings table should include:
translations TEXT,  -- JSON: {"en": {"key": "value"}, "nl": {"key": "waarde"}}
```

## Development Workflow

### 1. Initial Setup
```vue
<!-- app.vue -->
<template>
  <div>
    <NuxtPage />
    <DevModeToggle />
  </div>
</template>
```

### 2. Component Usage
```vue
<template>
  <div>
    <!-- Editable in dev mode -->
    <h1>{{ t('welcome.title') }}</h1>
    <UButton>{{ t('common.save') }}</UButton>
    
    <!-- Not editable (string only) -->
    <title>{{ tString('meta.title') }}</title>
  </div>
</template>

<script setup>
const { t, tString } = useT()
</script>
```

### 3. Development Process
1. **Enable Dev Mode**: Click floating toggle button
2. **Identify Translations**: See visual outlines on translatable text
3. **Edit Inline**: Click any outlined text to edit
4. **Save Changes**: Press Enter or click away
5. **See Updates**: Page refreshes with new translations

### 4. Translation States During Development

#### Existing System Translation
- **Visual**: Blue dashed outline
- **Behavior**: Edit updates system translation
- **Database**: Updates `translations_system` table

#### Team Override
- **Visual**: Green dashed outline with pulse
- **Behavior**: Edit updates team override
- **Database**: Updates `translations_ui` table

#### Missing Translation
- **Visual**: Red pulsing outline
- **Behavior**: Edit creates both system and team translation
- **Database**: Inserts into both tables
- **Display**: Shows `[translation.key]` placeholder

## Production Considerations

### Performance Impact
- **Development**: Minimal overhead from VNode wrapping
- **Production**: Zero impact - components render as plain strings
- **Bundle Size**: Dev-only code tree-shaken in production builds

### Security
- **API Protection**: Endpoints should validate user permissions
- **Team Context**: Ensure users can only edit their team's translations
- **Super Admin**: System translations require elevated permissions

### Caching Strategy
- **Team Settings**: Cache team translations in memory/Redis
- **Locale Files**: Sync to static JSON files for fast loading
- **Database**: Use appropriate indexes on keyPath and teamId

## Advanced Features

### Categorization System
```typescript
// Different categories for different contexts
t('common.save', { category: 'ui' })        // UI elements
t('hero.title', { category: 'marketing' })  // Marketing content
t('welcome.subject', { category: 'email' }) // Email templates
```

### Parameterized Translations
```typescript
// Support for dynamic values
t('welcome.message', { 
  params: { name: user.name, count: items.length } 
})
// "Hello {name}, you have {count} items"
```

### Fallback Chains
```typescript
// Multiple fallback strategies
t('missing.key', {
  fallback: 'Default text',
  placeholder: 'Enter translation...'
})
```

### Content Field Translation
```typescript
// Database entity translation
const product = {
  translations: {
    en: { name: 'Product Name', description: 'Product Description' },
    nl: { name: 'Product Naam', description: 'Product Beschrijving' }
  }
}

// Usage
tContent(product, 'name')        // Returns localized name
tContent(product, 'description') // Returns localized description
```

## Error Handling

### Client-Side Error Handling
```typescript
try {
  await saveTranslation(key, value)
  toast.add({ title: 'Success', color: 'green' })
} catch (error) {
  toast.add({ title: 'Save Failed', color: 'red' })
  console.error('Translation save failed:', error)
}
```

### Server-Side Error Handling
```typescript
export default defineEventHandler(async (event) => {
  try {
    // Translation logic
    return { success: true }
  } catch (error) {
    console.error('Database error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Translation save failed'
    })
  }
})
```

## Testing Strategy

### Unit Tests
```typescript
import { describe, it, expect } from 'vitest'
import { useT } from '~/composables/useT'

describe('useT composable', () => {
  it('should return system translation', () => {
    const { tString } = useT()
    expect(tString('common.save')).toBe('Save')
  })
  
  it('should detect missing translations', () => {
    const { hasTranslation } = useT()
    expect(hasTranslation('missing.key')).toBe(false)
  })
})
```

### Integration Tests
```typescript
describe('Translation API', () => {
  it('should create missing translations', async () => {
    const response = await $fetch('/api/teams/test/translations', {
      method: 'PATCH',
      body: {
        keyPath: 'new.translation',
        values: { en: 'New Translation' },
        createIfNotExists: true
      }
    })
    
    expect(response.created).toBe(true)
  })
})
```

### E2E Tests
```typescript
import { test, expect } from '@playwright/test'

test('dev mode translation editing', async ({ page }) => {
  await page.goto('/dashboard')
  
  // Enable dev mode
  await page.click('[data-testid="dev-mode-toggle"]')
  
  // Click translatable text
  await page.click('.dev-translatable')
  
  // Edit translation
  await page.fill('input', 'New Translation')
  await page.press('input', 'Enter')
  
  // Verify update
  await expect(page.locator('text=New Translation')).toBeVisible()
})
```

## Migration Strategy

### From Existing i18n System

#### Phase 1: Setup Infrastructure
1. Install enhanced useT composable
2. Add DevTranslationWrapper and DevModeToggle components
3. Create API endpoints
4. Update database schema

#### Phase 2: Gradual Migration
```typescript
// Before
const { $t } = useI18n()
$t('common.save')

// After
const { t } = useT()
t('common.save')
```

#### Phase 3: Team Customization
1. Enable team translation overrides
2. Migrate existing team customizations
3. Train teams on dev mode usage

### Data Migration Script
```typescript
// migrate-translations.ts
export async function migrateExistingTranslations() {
  const db = useDB()
  
  // Get existing translations
  const existing = await db.select().from(oldTranslationsTable)
  
  // Transform to new schema
  const transformed = existing.map(t => ({
    teamId: null, // System translation
    namespace: 'ui',
    keyPath: t.key,
    category: t.category || 'ui',
    values: JSON.stringify(t.translations),
    isOverrideable: true
  }))
  
  // Insert into new table
  await db.insert(translationsSystem).values(transformed)
}
```

## Performance Optimization

### Client-Side Optimizations
- **Component Lazy Loading**: DevTranslationWrapper only loads in dev
- **State Management**: Minimal reactive state for editing
- **Event Delegation**: Efficient click handling for multiple translations

### Server-Side Optimizations
- **Database Indexes**: On keyPath, teamId, namespace combinations
- **Caching**: Redis cache for frequently accessed translations
- **Batch Operations**: Bulk translation updates where possible

### Bundle Size Impact
```typescript
// Production build analysis
const devOnlyComponents = [
  'DevTranslationWrapper', // ~2KB
  'DevModeToggle'         // ~1KB
]
// Total dev-only overhead: ~3KB (tree-shaken in production)
```

## Security Considerations

### Authentication & Authorization
```typescript
// API endpoint protection
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  
  // System translations require super-admin
  if (!session.user.isSuperAdmin) {
    throw createError({ statusCode: 403 })
  }
  
  // Team translations require team membership
  const team = await getTeamBySlug(teamSlug)
  if (!team.members.includes(session.user.id)) {
    throw createError({ statusCode: 403 })
  }
})
```

### Input Validation
```typescript
const translationSchema = z.object({
  keyPath: z.string().min(1).max(100).regex(/^[a-zA-Z0-9._-]+$/),
  values: z.record(z.string().min(1).max(1000)),
  category: z.enum(['ui', 'marketing', 'email'])
})
```

### XSS Prevention
- All translations are properly escaped in templates
- Input sanitization on server-side
- CSP headers for additional protection

This comprehensive briefing covers all aspects of the in-place translation editing system, from architecture to implementation details, providing a complete technical reference for development and maintenance.
