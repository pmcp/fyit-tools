# POS Translation System Implementation Plan

## Project Overview
Build a multi-language POS system supporting infinite languages with English, Dutch, and French as priority languages. Use JSON-based translations with SQLite and Drizzle ORM in a Nuxt application.

## Core Principles
- **NO OVERENGINEERING** - Start simple, optimize only when needed
- Support infinite languages, optimize for EN/NL/FR
- Stay close to Nuxt i18n patterns
- Use JSON storage for all translations initially
- Migrate to separate tables only if needed

## Phase 1: Scaffolder Configuration Setup

### 1.1 Update Scaffolder Config
**File:** `Scaffolder/scaffolds/pos/config.js`

```javascript
module.exports = {
  dialect: 'sqlite',
  
  i18n: {
    locales: ['en', 'nl', 'fr'], // Priority languages
    defaultLocale: 'en',
    fallbackLocale: 'en'
  },
  
  translations: {
    // Collections that need translations
    collections: {
      products: ['name', 'description', 'remarkPrompt'],
      categories: ['name', 'description'],
      locations: ['name', 'description'],
      events: ['name', 'description', 'terms', 'conditions'],
      systemLogs: ['message', 'errorDescription', 'resolution'],
      clients: ['notes', 'description'],
      printers: ['name', 'statusMessage'],
      pages: ['title', 'content', 'excerpt', 'metaDescription']
    }
  },
  
  // Existing collections config...
  collections: [
    // ... your existing collections
  ]
}
```

### 1.2 Modify Schema Generation
Update the scaffolder to generate schemas with translation support:

```typescript
// For each translatable collection, generate:
export const products = sqliteTable('products', {
  id: integer('id').primaryKey(),
  
  // Default values (usually English) in main columns
  name: text('name').notNull(),
  description: text('description'),
  
  // All translations in JSON
  translations: text('translations').$type<{
    [locale: string]: {
      name?: string
      description?: string
      remarkPrompt?: string
    }
  }>(),
  
  // Non-translatable fields
  price: real('price'),
  eventId: integer('event_id'),
  
  // Metadata
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
}, (table) => ({
  // Functional indexes for priority languages
  nameEnIdx: index('idx_name_en').on(sql`json_extract(${table.translations}, '$.en.name')`),
  nameNlIdx: index('idx_name_nl').on(sql`json_extract(${table.translations}, '$.nl.name')`),
  nameFrIdx: index('idx_name_fr').on(sql`json_extract(${table.translations}, '$.fr.name')`)
}))
```

## Phase 2: Core Translation Utilities

### 2.1 Create Translation Composable
**File:** `app/composables/useTrans.ts`

```typescript
export function useTrans() {
  const { locale, fallbackLocale, defaultLocale } = useI18n()
  
  // Get translation with fallback chain
  function t(entity: any, field: string): string {
    if (!entity) return ''
    
    // Try current locale
    const translated = entity.translations?.[locale.value]?.[field]
    if (translated) return translated
    
    // Try fallback locale
    const fallback = entity.translations?.[fallbackLocale.value]?.[field]
    if (fallback) return fallback
    
    // Return default field value (usually English)
    return entity[field] || ''
  }
  
  // Batch translate multiple fields
  function tFields(entity: any, fields: string[]): Record<string, string> {
    return fields.reduce((acc, field) => {
      acc[field] = t(entity, field)
      return acc
    }, {} as Record<string, string>)
  }
  
  // For system logs with message keys
  function tLog(log: any): string {
    const { t: $t } = useI18n()
    
    // If it has a message key, use i18n
    if (log.messageKey) {
      return $t(log.messageKey, log.messageData || {})
    }
    
    // Otherwise use translated message
    return t(log, 'message')
  }
  
  return { t, tFields, tLog }
}
```

### 2.2 Create Server-Side Translation Utils
**File:** `server/utils/translations.ts`

```typescript
import { sql } from 'drizzle-orm'

export function getTranslatedField(
  table: any,
  field: string,
  locale: string,
  fallbackToDefault = true
) {
  if (fallbackToDefault) {
    return sql<string>`
      COALESCE(
        json_extract(${table.translations}, '$.' || ${locale} || '.' || ${field}),
        ${table[field]}
      )
    `.as(field)
  }
  
  return sql<string>`
    json_extract(${table.translations}, '$.' || ${locale} || '.' || ${field})
  `.as(field)
}

export function getTranslatedFields(
  table: any,
  fields: string[],
  locale: string
) {
  return fields.reduce((acc, field) => {
    acc[field] = getTranslatedField(table, field, locale)
    return acc
  }, {} as Record<string, any>)
}
```

## Phase 3: API Implementation

### 3.1 Update API Endpoints
**Example:** `server/api/pos/products/index.get.ts`

```typescript
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const locale = String(query.locale || 'en')
  const search = String(query.search || '')
  
  const translatedFields = getTranslatedFields(
    products,
    ['name', 'description'],
    locale
  )
  
  const results = await db
    .select({
      id: products.id,
      ...translatedFields,
      price: products.price,
      translations: products.translations
    })
    .from(products)
    .where(
      search 
        ? sql`${translatedFields.name} LIKE ${`%${search}%`}`
        : undefined
    )
    .orderBy(sql`${translatedFields.name} COLLATE NOCASE`)
    .limit(50)
    
  return results
})
```

### 3.2 Update Mutations
**Example:** `server/api/pos/products/[id].patch.ts`

```typescript
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const locale = String(body.locale || 'en')
  
  // If updating translation
  if (locale !== 'en' && body.translations) {
    const existing = await db
      .select({ translations: products.translations })
      .from(products)
      .where(eq(products.id, id))
      .get()
    
    const updatedTranslations = {
      ...existing?.translations,
      [locale]: {
        ...existing?.translations?.[locale],
        ...body.translations[locale]
      }
    }
    
    await db
      .update(products)
      .set({ translations: updatedTranslations })
      .where(eq(products.id, id))
  } else {
    // Update main fields
    await db
      .update(products)
      .set(body)
      .where(eq(products.id, id))
  }
  
  return { success: true }
})
```

## Phase 4: Frontend Components

### 4.1 Update List Components
**Example:** `app/components/ProductsList.vue`

```vue
<script setup>
const { t } = useTrans()
const { locale } = useI18n()

const { data: products } = await $fetch('/api/pos/products', {
  query: { locale: locale.value }
})
</script>

<template>
  <UTable :rows="products">
    <template #name-data="{ row }">
      {{ t(row, 'name') }}
    </template>
    <template #description-data="{ row }">
      {{ t(row, 'description') }}
    </template>
  </UTable>
</template>
```

### 4.2 Update Form Components
**Example:** `app/components/ProductForm.vue`

```vue
<script setup>
const { locale, locales } = useI18n()
const { t } = useTrans()

const props = defineProps<{
  product?: Product
}>()

const formState = ref({
  name: props.product?.name || '',
  description: props.product?.description || '',
  translations: props.product?.translations || {}
})

// Track which locale we're editing
const editingLocale = ref(locale.value)

// Load translations for current editing locale
watch(editingLocale, (newLocale) => {
  if (newLocale === 'en') {
    formState.value.name = props.product?.name || ''
    formState.value.description = props.product?.description || ''
  } else {
    formState.value.name = props.product?.translations?.[newLocale]?.name || ''
    formState.value.description = props.product?.translations?.[newLocale]?.description || ''
  }
})

async function save() {
  if (editingLocale.value === 'en') {
    // Save to main fields
    await $fetch(`/api/pos/products/${props.product.id}`, {
      method: 'PATCH',
      body: {
        name: formState.value.name,
        description: formState.value.description
      }
    })
  } else {
    // Save to translations
    await $fetch(`/api/pos/products/${props.product.id}`, {
      method: 'PATCH',
      body: {
        locale: editingLocale.value,
        translations: {
          [editingLocale.value]: {
            name: formState.value.name,
            description: formState.value.description
          }
        }
      }
    })
  }
}
</script>

<template>
  <UForm :state="formState" @submit="save">
    <!-- Language selector -->
    <USelectMenu
      v-model="editingLocale"
      :options="locales"
      label="Editing Language"
    />
    
    <UFormField label="Name" name="name">
      <UInput v-model="formState.name" />
    </UFormField>
    
    <UFormField label="Description" name="description">
      <UTextarea v-model="formState.description" />
    </UFormField>
    
    <UButton type="submit">Save</UButton>
  </UForm>
</template>
```

## Phase 5: Migration Scripts (Future)

### 5.1 When to Migrate to Separate Tables
Monitor these metrics:
- JSON field size > 100KB per row
- Query performance > 100ms for translated queries
- Need for translation workflow (draft/published per language)
- Need for full-text search per language

### 5.2 Migration Script Template
```sql
-- Only if needed for specific collections like pages
CREATE TABLE page_translations (
  id INTEGER PRIMARY KEY,
  page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  is_published INTEGER DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER,
  UNIQUE(page_id, locale)
);

-- Migrate existing data
INSERT INTO page_translations (page_id, locale, title, content, excerpt)
SELECT 
  id,
  'en',
  title,
  content,
  excerpt
FROM pages;

-- Migrate translations
INSERT INTO page_translations (page_id, locale, title, content, excerpt)
SELECT 
  id,
  key,
  json_extract(value, '$.title'),
  json_extract(value, '$.content'),
  json_extract(value, '$.excerpt')
FROM pages, json_each(pages.translations);
```

## Phase 6: Testing Plan

### 6.1 Unit Tests
```typescript
// tests/translations.test.ts
describe('Translation System', () => {
  it('returns correct translation for requested locale', () => {
    const product = {
      name: 'Coffee',
      translations: {
        nl: { name: 'Koffie' },
        fr: { name: 'Café' }
      }
    }
    
    const { t } = useTrans()
    expect(t(product, 'name')).toBe('Koffie') // if locale is 'nl'
  })
  
  it('falls back to default when translation missing', () => {
    const product = {
      name: 'Coffee',
      translations: {}
    }
    
    const { t } = useTrans()
    expect(t(product, 'name')).toBe('Coffee')
  })
})
```

### 6.2 Performance Tests
```typescript
// Monitor query performance
const start = Date.now()
const results = await db.select().from(products).limit(1000)
const duration = Date.now() - start

if (duration > 100) {
  console.warn(`Slow query detected: ${duration}ms`)
}
```

## Phase 7: Monitoring & Optimization

### 7.1 Add Performance Monitoring
```typescript
// server/plugins/monitor.ts
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('afterResponse', (event, response) => {
    if (event.node.req.url?.includes('/api/pos/')) {
      const duration = Date.now() - event.context.startTime
      if (duration > 100) {
        console.warn(`Slow API call: ${event.node.req.url} took ${duration}ms`)
      }
    }
  })
})
```

### 7.2 Optimization Checklist
- [ ] Add indexes only where needed (after measuring)
- [ ] Monitor JSON field sizes
- [ ] Cache frequently accessed translations
- [ ] Consider CDN for static translated content
- [ ] Add pagination for large result sets

## Implementation Timeline

### Week 1: Foundation
- [ ] Update scaffolder config
- [ ] Create useTrans composable
- [ ] Update schema generation
- [ ] Create server utilities

### Week 2: API Layer
- [ ] Update all GET endpoints
- [ ] Update all mutation endpoints
- [ ] Add translation validation
- [ ] Test with sample data

### Week 3: Frontend
- [ ] Update list components
- [ ] Update form components
- [ ] Add language switcher
- [ ] Test user flows

### Week 4: Testing & Optimization
- [ ] Write unit tests
- [ ] Performance testing
- [ ] Add monitoring
- [ ] Document edge cases

## Success Criteria
- ✅ All collections support translations
- ✅ EN/NL/FR work seamlessly
- ✅ Can add new languages without schema changes
- ✅ Query performance < 50ms for typical queries
- ✅ Forms can edit any language
- ✅ Fallback chain works correctly

## Notes for AI Assistants
1. **Priority**: Function over form - make it work first, optimize later
2. **JSON Approach**: Stick with JSON for everything initially
3. **Indexes**: Only add for EN/NL/FR and only on frequently searched fields
4. **Testing**: Test with real data volumes before optimizing
5. **Migration**: Only migrate to separate tables if JSON becomes a bottleneck

## Common Pitfalls to Avoid
- Don't create generated columns
- Don't index every field
- Don't optimize prematurely
- Don't migrate to separate tables unless necessary
- Don't forget the fallback chain

## Questions to Ask Before Changes
1. Is this solving a real problem we have now?
2. Will this work with our existing scaffolder?
3. Does this add complexity without clear benefit?
4. Can we achieve the same with less code?

---

**Remember**: The best code is no code. The second best is simple code that works.