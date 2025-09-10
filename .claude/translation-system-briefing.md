# Translation System Implementation Briefing

## Executive Summary

This document outlines a lightweight, three-tier translation system for a multi-tenant SaaS platform. The system supports three distinct personas with different translation needs while maintaining simplicity and avoiding over-engineering.

## System Overview

### Three Translation Personas

1. **Platform Owner**: System-wide UI translations (login, buttons, navigation)
2. **Workspace Admins**: Team-specific customizations and email templates
3. **Content Creators**: Multi-language content (products, pages, etc.)

### Core Principles

- **Lightweight**: No unnecessary abstractions or complex caching
- **Consistent**: Single pattern (JSON) used throughout
- **Pragmatic**: Built for 3-5 languages, not 50
- **Simple**: ~200 lines of code total for entire system

## Architecture

### Data Storage Strategy

```
┌─────────────────────┐
│   Static Files      │ ← Platform translations (en.json, nl.json)
├─────────────────────┤
│   Team Settings     │ ← Workspace overrides (JSON column)
├─────────────────────┤
│   Email Templates   │ ← Customizable emails (JSON column)
├─────────────────────┤
│   Content Tables    │ ← Product/Page translations (JSON column)
└─────────────────────┘
```

## Implementation Details

### 1. Platform-Level Translations

**Location**: `/locales/[locale].json`

**Structure**:
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "search": "Search",
    "filter": "Filter",
    "export": "Export"
  },
  "auth": {
    "login": "Login",
    "logout": "Logout",
    "password": "Password",
    "email": "Email",
    "forgotPassword": "Forgot password?",
    "resetPassword": "Reset password",
    "register": "Register"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "products": "Products",
    "orders": "Orders",
    "customers": "Customers",
    "settings": "Settings"
  },
  "messages": {
    "success": "Operation successful",
    "error": "An error occurred",
    "loading": "Loading...",
    "confirmDelete": "Are you sure you want to delete this?",
    "saved": "Changes saved",
    "required": "This field is required"
  },
  "email": {
    "orderConfirmation": "Order Confirmation",
    "invoice": "Invoice",
    "passwordReset": "Password Reset",
    "welcome": "Welcome"
  }
}
```

### 2. Database Schema

#### Team Settings Table
```sql
CREATE TABLE team_settings (
  id INTEGER PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES teams(id),
  translations TEXT, -- JSON: {"en": {"save": "Submit"}, "nl": {...}}
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id)
);
```

#### Email Templates Table
```sql
CREATE TABLE email_templates (
  id INTEGER PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES teams(id),
  type TEXT NOT NULL, -- 'order_confirmation', 'invoice', etc.
  translations TEXT, -- JSON: {"en": {"subject": "...", "body": "..."}}
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, type)
);
```

#### Content Tables (Example: Products)
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES teams(id),
  -- Regular fields
  name TEXT NOT NULL,
  description TEXT,
  price REAL,
  -- Translation field
  translations TEXT, -- JSON: {"nl": {"name": "...", "description": "..."}}
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Generated columns for indexed locales (performance)
ALTER TABLE products ADD COLUMN name_nl TEXT 
  GENERATED ALWAYS AS (json_extract(translations, '$.nl.name')) STORED;
CREATE INDEX idx_products_name_nl ON products(name_nl);
```

### 3. Drizzle Schema (TypeScript)

```typescript
// server/database/schema.ts
import { sqliteTable, text, integer, unique, index } from 'drizzle-orm/sqlite-core'

// Team settings with translation overrides
export const teamSettings = sqliteTable('team_settings', {
  id: integer('id').primaryKey(),
  teamId: text('team_id').notNull().references(() => teams.id),
  translations: text('translations').$type<{
    [locale: string]: {
      [key: string]: string
    }
  }>(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  uniqueTeam: unique().on(table.teamId)
}))

// Email templates
export const emailTemplates = sqliteTable('email_templates', {
  id: integer('id').primaryKey(),
  teamId: text('team_id').notNull().references(() => teams.id),
  type: text('type').notNull(),
  translations: text('translations').$type<{
    [locale: string]: {
      subject: string
      body: string
    }
  }>(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  uniqueTeamType: unique().on(table.teamId, table.type)
}))

// Products with translations
export const products = sqliteTable('products', {
  id: integer('id').primaryKey(),
  teamId: text('team_id').notNull().references(() => teams.id),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price'),
  translations: text('translations').$type<{
    [locale: string]: {
      name?: string
      description?: string
    }
  }>(),
  // Generated columns for performance
  nameNl: text('name_nl').generatedAlwaysAs(
    sql`json_extract(translations, '$.nl.name')`
  ),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  nameNlIdx: index('idx_products_name_nl').on(table.nameNl)
}))
```

### 4. Core Utilities

#### Client-Side Translation Composable

```typescript
// composables/useT.ts
export function useT() {
  const { t, locale } = useI18n()
  const team = useTeam() // Your existing team context
  
  // Translation with fallback chain: Team → System → Key
  return function translate(key: string, params?: Record<string, any>) {
    // Check team overrides first
    const override = team.value?.settings?.translations?.[locale.value]?.[key]
    if (override) {
      // Simple parameter replacement
      if (params) {
        return override.replace(/\{(\w+)\}/g, (_, k) => params[k] || '')
      }
      return override
    }
    
    // Fall back to system translation
    return t(key, params)
  }
}
```

#### Server-Side Translation Helper

```typescript
// server/utils/serverTranslations.ts
import en from '~/locales/en.json'
import nl from '~/locales/nl.json'
import fr from '~/locales/fr.json'

const systemTranslations = { en, nl, fr }

export async function getTranslation(
  locale: string,
  key: string,
  teamId?: string
): Promise<string> {
  // Check team overrides if teamId provided
  if (teamId) {
    const settings = await db.select()
      .from(teamSettings)
      .where(eq(teamSettings.teamId, teamId))
      .first()
    
    const override = settings?.translations?.[locale]?.[key]
    if (override) return override
  }
  
  // Navigate nested keys (e.g., "auth.login")
  const keys = key.split('.')
  let value: any = systemTranslations[locale] || systemTranslations['en']
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  return value || key
}

// Convenience function for multiple translations
export async function getTranslations(
  locale: string,
  keys: string[],
  teamId?: string
): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  
  for (const key of keys) {
    result[key] = await getTranslation(locale, key, teamId)
  }
  
  return result
}
```

#### Content Translation Helper

```typescript
// composables/useContentTranslation.ts
export function useContentTranslation() {
  const { locale, fallbackLocale } = useI18n()
  
  // Get field with fallback chain
  function getField(
    entity: any,
    field: string,
    preferredLocale?: string
  ): string {
    const loc = preferredLocale || locale.value
    
    // Try requested locale
    const translated = entity?.translations?.[loc]?.[field]
    if (translated) return translated
    
    // Try fallback locales
    const fallbacks = Array.isArray(fallbackLocale.value) 
      ? fallbackLocale.value 
      : [fallbackLocale.value]
    
    for (const fb of fallbacks) {
      const fallbackValue = entity?.translations?.[fb]?.[field]
      if (fallbackValue) return fallbackValue
    }
    
    // Return original field
    return entity?.[field] || ''
  }
  
  return { getField }
}
```

### 5. Email System

#### Default Templates

```typescript
// server/utils/emails/templates.ts
export const emailTemplateTypes = [
  'order_confirmation',
  'invoice',
  'password_reset',
  'welcome',
  'order_shipped',
  'payment_received'
] as const

export type EmailTemplateType = typeof emailTemplateTypes[number]

export const defaultTemplates: Record<EmailTemplateType, Record<string, any>> = {
  order_confirmation: {
    en: {
      subject: "Order {{orderNumber}} confirmed",
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .header { background: #f4f4f4; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .order-details { background: #f9f9f9; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Order Confirmation</h1>
  </div>
  <div class="content">
    <p>Hi {{customerName}},</p>
    <p>Thank you for your order! Your order #{{orderNumber}} has been confirmed.</p>
    
    <div class="order-details">
      <h3>Order Details:</h3>
      <p><strong>Order Number:</strong> {{orderNumber}}</p>
      <p><strong>Date:</strong> {{orderDate}}</p>
      <p><strong>Total:</strong> {{total}}</p>
      
      <h4>Items:</h4>
      <ul>
        {{#each items}}
        <li>{{this.name}} - Qty: {{this.quantity}} - {{this.price}}</li>
        {{/each}}
      </ul>
    </div>
    
    <p>We'll send you another email when your order ships.</p>
  </div>
  <div class="footer">
    <p>Questions? Reply to this email or contact support.</p>
  </div>
</body>
</html>
      `
    },
    nl: {
      subject: "Bestelling {{orderNumber}} bevestigd",
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .header { background: #f4f4f4; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .order-details { background: #f9f9f9; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Orderbevestiging</h1>
  </div>
  <div class="content">
    <p>Hallo {{customerName}},</p>
    <p>Bedankt voor uw bestelling! Uw bestelling #{{orderNumber}} is bevestigd.</p>
    
    <div class="order-details">
      <h3>Bestelgegevens:</h3>
      <p><strong>Bestelnummer:</strong> {{orderNumber}}</p>
      <p><strong>Datum:</strong> {{orderDate}}</p>
      <p><strong>Totaal:</strong> {{total}}</p>
      
      <h4>Artikelen:</h4>
      <ul>
        {{#each items}}
        <li>{{this.name}} - Aantal: {{this.quantity}} - {{this.price}}</li>
        {{/each}}
      </ul>
    </div>
    
    <p>We sturen u een e-mail wanneer uw bestelling is verzonden.</p>
  </div>
  <div class="footer">
    <p>Vragen? Reageer op deze e-mail of neem contact op met support.</p>
  </div>
</body>
</html>
      `
    }
  },
  // ... other templates
}
```

#### Email Sending Service

```typescript
// server/utils/emails/emailService.ts
import Handlebars from 'handlebars'
// Or use simple string replacement if you want even lighter

export async function sendTeamEmail(
  teamId: string,
  type: EmailTemplateType,
  to: string | string[],
  locale: string,
  data: Record<string, any>
) {
  // Get custom template or fall back to default
  const customTemplate = await db.select()
    .from(emailTemplates)
    .where(and(
      eq(emailTemplates.teamId, teamId),
      eq(emailTemplates.type, type)
    ))
    .first()
  
  // Fallback chain: Custom → Default → English default
  const template = 
    customTemplate?.translations?.[locale] ||
    customTemplate?.translations?.['en'] ||
    defaultTemplates[type]?.[locale] ||
    defaultTemplates[type]?.['en']
  
  if (!template) {
    throw new Error(`No email template found for type: ${type}`)
  }
  
  // Compile templates (or use simple replacement)
  const subjectTemplate = Handlebars.compile(template.subject)
  const bodyTemplate = Handlebars.compile(template.body)
  
  const subject = subjectTemplate(data)
  const html = bodyTemplate(data)
  
  // Send via your email provider (SendGrid, Resend, etc.)
  await sendEmail({
    to: Array.isArray(to) ? to : [to],
    subject,
    html
  })
  
  // Log email sent
  await logEmail({
    teamId,
    type,
    to: Array.isArray(to) ? to.join(', ') : to,
    locale,
    sentAt: new Date().toISOString()
  })
}

// Simple version without Handlebars
export async function sendTeamEmailSimple(
  teamId: string,
  type: EmailTemplateType,
  to: string,
  locale: string,
  data: Record<string, any>
) {
  // ... get template same as above ...
  
  // Simple string replacement
  let subject = template.subject
  let body = template.body
  
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    subject = subject.replace(regex, String(value))
    body = body.replace(regex, String(value))
  })
  
  // Handle arrays (basic)
  const arrayMatches = body.match(/{{#each (\w+)}}(.*?){{\/each}}/gs)
  if (arrayMatches) {
    arrayMatches.forEach(match => {
      const [, arrayName, itemTemplate] = match.match(/{{#each (\w+)}}(.*?){{\/each}}/s)
      const items = data[arrayName] as any[]
      const rendered = items.map(item => {
        let itemHtml = itemTemplate
        Object.entries(item).forEach(([k, v]) => {
          itemHtml = itemHtml.replace(new RegExp(`{{this\\.${k}}}`, 'g'), String(v))
        })
        return itemHtml
      }).join('')
      body = body.replace(match, rendered)
    })
  }
  
  await sendEmail({ to, subject, html: body })
}
```

### 6. API Endpoints

#### Team Settings API

```typescript
// server/api/teams/[id]/settings.get.ts
export default defineEventHandler(async (event) => {
  const { id: teamId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  
  // Check permissions
  const hasAccess = await isTeamAdmin(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }
  
  const settings = await db.select()
    .from(teamSettings)
    .where(eq(teamSettings.teamId, teamId))
    .first()
  
  return settings || { translations: {} }
})

// server/api/teams/[id]/settings.patch.ts
export default defineEventHandler(async (event) => {
  const { id: teamId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const body = await readBody(event)
  
  const hasAccess = await isTeamAdmin(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }
  
  await db.insert(teamSettings)
    .values({
      teamId,
      translations: body.translations,
      updatedAt: new Date().toISOString()
    })
    .onConflictDoUpdate({
      target: teamSettings.teamId,
      set: {
        translations: body.translations,
        updatedAt: new Date().toISOString()
      }
    })
  
  return { success: true }
})
```

#### Email Templates API

```typescript
// server/api/teams/[id]/email-templates/index.get.ts
export default defineEventHandler(async (event) => {
  const { id: teamId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  
  const hasAccess = await isTeamAdmin(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }
  
  const templates = await db.select()
    .from(emailTemplates)
    .where(eq(emailTemplates.teamId, teamId))
  
  // Merge with defaults for UI
  const merged = { ...defaultTemplates }
  templates.forEach(t => {
    merged[t.type] = t.translations
  })
  
  return merged
})

// server/api/teams/[id]/email-templates/[type].put.ts
export default defineEventHandler(async (event) => {
  const { id: teamId, type } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const body = await readBody(event)
  
  const hasAccess = await isTeamAdmin(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }
  
  // Validate template type
  if (!emailTemplateTypes.includes(type as EmailTemplateType)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid template type' })
  }
  
  await db.insert(emailTemplates)
    .values({
      teamId,
      type,
      translations: body.translations,
      updatedAt: new Date().toISOString()
    })
    .onConflictDoUpdate({
      target: [emailTemplates.teamId, emailTemplates.type],
      set: {
        translations: body.translations,
        updatedAt: new Date().toISOString()
      }
    })
  
  return { success: true }
})

// server/api/teams/[id]/email-templates/[type]/preview.post.ts
export default defineEventHandler(async (event) => {
  const { id: teamId, type } = getRouterParams(event)
  const { locale, sampleData } = await readBody(event)
  
  // Generate preview with sample data
  const template = await getEmailTemplate(teamId, type, locale)
  const html = renderTemplate(template.body, sampleData)
  const subject = renderTemplate(template.subject, sampleData)
  
  return { subject, html }
})
```

### 7. UI Components

#### Translation Settings Page

```vue
<!-- pages/team/[id]/settings/translations.vue -->
<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">Workspace Translations</h2>
          <UButton 
            @click="resetToDefaults" 
            variant="outline"
            size="sm"
          >
            Reset to Defaults
          </UButton>
        </div>
      </template>
      
      <!-- Language selector -->
      <UTabs v-model="activeLocale" :items="localeItems">
        <template #item="{ item }">
          <div class="space-y-4">
            <!-- Search -->
            <UInput
              v-model="searchQuery"
              placeholder="Search translations..."
              icon="i-heroicons-magnifying-glass"
            />
            
            <!-- Translation fields -->
            <div class="space-y-6">
              <div 
                v-for="(group, groupKey) in filteredTranslations" 
                :key="groupKey"
                class="space-y-3"
              >
                <h3 class="font-medium text-gray-700 capitalize">
                  {{ groupKey }}
                </h3>
                
                <div 
                  v-for="(value, key) in group" 
                  :key="`${groupKey}.${key}`"
                  class="grid grid-cols-2 gap-4 items-center"
                >
                  <label class="text-sm text-gray-600">
                    {{ key }}
                    <span 
                      v-if="isOverridden(groupKey, key)"
                      class="ml-2 text-xs text-blue-600"
                    >
                      (customized)
                    </span>
                  </label>
                  
                  <UInput
                    :model-value="getTranslation(groupKey, key)"
                    @update:model-value="setTranslation(groupKey, key, $event)"
                    :placeholder="getDefaultTranslation(groupKey, key)"
                    size="sm"
                  />
                </div>
              </div>
            </div>
            
            <!-- Save button -->
            <div class="flex justify-end pt-4">
              <UButton 
                @click="saveTranslations"
                :loading="saving"
              >
                Save Changes
              </UButton>
            </div>
          </div>
        </template>
      </UTabs>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { TeamSettings } from '~/types'

const route = useRoute()
const teamId = route.params.id as string
const { locale, locales } = useI18n()

// Load system translations for reference
const systemTranslations = ref<Record<string, any>>({})
const teamTranslations = ref<Record<string, any>>({})
const activeLocale = ref(locale.value)
const searchQuery = ref('')
const saving = ref(false)

const localeItems = computed(() => 
  locales.value.map(l => ({
    key: typeof l === 'string' ? l : l.code,
    label: typeof l === 'string' ? l.toUpperCase() : l.name
  }))
)

// Load translations
onMounted(async () => {
  // Load system translations
  for (const loc of locales.value) {
    const code = typeof loc === 'string' ? loc : loc.code
    const module = await import(`~/locales/${code}.json`)
    systemTranslations.value[code] = module.default
  }
  
  // Load team customizations
  const { data } = await $fetch(`/api/teams/${teamId}/settings`)
  teamTranslations.value = data?.translations || {}
})

// Filter translations based on search
const filteredTranslations = computed(() => {
  const current = systemTranslations.value[activeLocale.value] || {}
  
  if (!searchQuery.value) return current
  
  const filtered: Record<string, any> = {}
  const query = searchQuery.value.toLowerCase()
  
  Object.entries(current).forEach(([groupKey, group]) => {
    const filteredGroup: Record<string, any> = {}
    
    Object.entries(group as Record<string, string>).forEach(([key, value]) => {
      if (
        key.toLowerCase().includes(query) ||
        value.toLowerCase().includes(query)
      ) {
        filteredGroup[key] = value
      }
    })
    
    if (Object.keys(filteredGroup).length > 0) {
      filtered[groupKey] = filteredGroup
    }
  })
  
  return filtered
})

function getTranslation(group: string, key: string): string {
  return teamTranslations.value[activeLocale.value]?.[`${group}.${key}`] || ''
}

function getDefaultTranslation(group: string, key: string): string {
  return systemTranslations.value[activeLocale.value]?.[group]?.[key] || ''
}

function setTranslation(group: string, key: string, value: string) {
  if (!teamTranslations.value[activeLocale.value]) {
    teamTranslations.value[activeLocale.value] = {}
  }
  
  const fullKey = `${group}.${key}`
  
  if (value === getDefaultTranslation(group, key)) {
    // Remove override if same as default
    delete teamTranslations.value[activeLocale.value][fullKey]
  } else {
    teamTranslations.value[activeLocale.value][fullKey] = value
  }
}

function isOverridden(group: string, key: string): boolean {
  return !!teamTranslations.value[activeLocale.value]?.[`${group}.${key}`]
}

async function saveTranslations() {
  saving.value = true
  
  try {
    await $fetch(`/api/teams/${teamId}/settings`, {
      method: 'PATCH',
      body: {
        translations: teamTranslations.value
      }
    })
    
    toast.success('Translations saved successfully')
  } catch (error) {
    toast.error('Failed to save translations')
  } finally {
    saving.value = false
  }
}

function resetToDefaults() {
  teamTranslations.value[activeLocale.value] = {}
  toast.info('Reset to default translations')
}
</script>
```

#### Email Template Editor

```vue
<!-- pages/team/[id]/settings/email-templates.vue -->
<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">Email Templates</h2>
      </template>
      
      <!-- Template type selector -->
      <UTabs v-model="activeTemplate" :items="templateItems">
        <template #item="{ item }">
          <div class="space-y-4">
            <!-- Language tabs -->
            <UTabs v-model="activeLocale" :items="localeItems">
              <template #item="{ item: locale }">
                <div class="space-y-4">
                  <!-- Subject -->
                  <UFormGroup label="Subject">
                    <UInput
                      v-model="currentTemplate.subject"
                      placeholder="Email subject..."
                    />
                  </UFormGroup>
                  
                  <!-- Body -->
                  <UFormGroup label="Body">
                    <div class="space-y-2">
                      <div class="flex justify-between items-center">
                        <label class="text-sm font-medium">HTML Template</label>
                        <div class="space-x-2">
                          <UButton
                            @click="toggleEditor"
                            variant="outline"
                            size="xs"
                          >
                            {{ showVisualEditor ? 'HTML' : 'Visual' }}
                          </UButton>
                          <UButton
                            @click="showPreview = true"
                            variant="outline"
                            size="xs"
                          >
                            Preview
                          </UButton>
                        </div>
                      </div>
                      
                      <!-- HTML Editor -->
                      <UTextarea
                        v-if="!showVisualEditor"
                        v-model="currentTemplate.body"
                        :rows="20"
                        class="font-mono text-sm"
                      />
                      
                      <!-- Visual Editor (optional, using tiptap or similar) -->
                      <div 
                        v-else
                        class="border rounded-md p-4 min-h-[400px]"
                      >
                        <!-- Rich text editor here -->
                        <div v-html="currentTemplate.body"></div>
                      </div>
                    </div>
                  </UFormGroup>
                  
                  <!-- Available variables -->
                  <UAlert
                    icon="i-heroicons-information-circle"
                    color="blue"
                    variant="soft"
                  >
                    <template #title>Available Variables</template>
                    <div class="mt-2 text-sm">
                      <code class="text-xs">
                        {{ getVariablesForTemplate(activeTemplate) }}
                      </code>
                    </div>
                  </UAlert>
                  
                  <!-- Actions -->
                  <div class="flex justify-between">
                    <UButton
                      @click="resetTemplate"
                      variant="outline"
                      color="red"
                    >
                      Reset to Default
                    </UButton>
                    
                    <UButton
                      @click="saveTemplate"
                      :loading="saving"
                    >
                      Save Template
                    </UButton>
                  </div>
                </div>
              </template>
            </UTabs>
          </div>
        </template>
      </UTabs>
    </UCard>
    
    <!-- Preview Modal -->
    <UModal v-model="showPreview">
      <UCard>
        <template #header>
          <h3 class="font-semibold">Email Preview</h3>
        </template>
        
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium">Subject:</label>
            <p class="mt-1">{{ renderedPreview.subject }}</p>
          </div>
          
          <div>
            <label class="text-sm font-medium">Body:</label>
            <div 
              class="mt-2 border rounded p-4 bg-white"
              v-html="renderedPreview.body"
            ></div>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const teamId = route.params.id as string
const { locale, locales } = useI18n()

const templates = ref<Record<string, any>>({})
const activeTemplate = ref('order_confirmation')
const activeLocale = ref(locale.value)
const showVisualEditor = ref(false)
const showPreview = ref(false)
const saving = ref(false)

const templateItems = [
  { key: 'order_confirmation', label: 'Order Confirmation' },
  { key: 'invoice', label: 'Invoice' },
  { key: 'password_reset', label: 'Password Reset' },
  { key: 'welcome', label: 'Welcome Email' },
  { key: 'order_shipped', label: 'Order Shipped' },
  { key: 'payment_received', label: 'Payment Received' }
]

const localeItems = computed(() => 
  locales.value.map(l => ({
    key: typeof l === 'string' ? l : l.code,
    label: typeof l === 'string' ? l.toUpperCase() : l.name
  }))
)

const currentTemplate = computed({
  get: () => templates.value[activeTemplate.value]?.[activeLocale.value] || {
    subject: '',
    body: ''
  },
  set: (value) => {
    if (!templates.value[activeTemplate.value]) {
      templates.value[activeTemplate.value] = {}
    }
    templates.value[activeTemplate.value][activeLocale.value] = value
  }
})

const renderedPreview = computed(() => {
  const template = currentTemplate.value
  const sampleData = getSampleData(activeTemplate.value)
  
  return {
    subject: renderTemplate(template.subject, sampleData),
    body: renderTemplate(template.body, sampleData)
  }
})

// Load templates
onMounted(async () => {
  const { data } = await $fetch(`/api/teams/${teamId}/email-templates`)
  templates.value = data
})

async function saveTemplate() {
  saving.value = true
  
  try {
    await $fetch(`/api/teams/${teamId}/email-templates/${activeTemplate.value}`, {
      method: 'PUT',
      body: {
        translations: templates.value[activeTemplate.value]
      }
    })
    
    toast.success('Template saved successfully')
  } catch (error) {
    toast.error('Failed to save template')
  } finally {
    saving.value = false
  }
}

function resetTemplate() {
  // Reset to default template
  delete templates.value[activeTemplate.value]?.[activeLocale.value]
  toast.info('Template reset to default')
}

function getVariablesForTemplate(type: string): string {
  const variables: Record<string, string[]> = {
    order_confirmation: [
      '{{customerName}}',
      '{{orderNumber}}',
      '{{orderDate}}',
      '{{total}}',
      '{{#each items}}...{{/each}}'
    ],
    invoice: [
      '{{invoiceNumber}}',
      '{{dueDate}}',
      '{{customerName}}',
      '{{total}}',
      '{{taxAmount}}'
    ],
    // ... other templates
  }
  
  return variables[type]?.join(', ') || ''
}

function getSampleData(type: string): Record<string, any> {
  const samples: Record<string, any> = {
    order_confirmation: {
      customerName: 'John Doe',
      orderNumber: 'ORD-2024-001',
      orderDate: new Date().toLocaleDateString(),
      total: '$99.99',
      items: [
        { name: 'Product 1', quantity: 2, price: '$49.99' },
        { name: 'Product 2', quantity: 1, price: '$50.00' }
      ]
    },
    // ... other sample data
  }
  
  return samples[type] || {}
}

function renderTemplate(template: string, data: Record<string, any>): string {
  let rendered = template
  
  // Simple variable replacement
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value !== 'object') {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
    }
  })
  
  // Handle arrays (basic)
  const arrayMatches = rendered.match(/{{#each (\w+)}}(.*?){{\/each}}/gs) || []
  arrayMatches.forEach(match => {
    const [, arrayName, itemTemplate] = match.match(/{{#each (\w+)}}(.*?){{\/each}}/s) || []
    if (arrayName && data[arrayName]) {
      const items = data[arrayName] as any[]
      const itemsHtml = items.map(item => {
        let itemHtml = itemTemplate
        Object.entries(item).forEach(([k, v]) => {
          itemHtml = itemHtml.replace(new RegExp(`{{this\\.${k}}}`, 'g'), String(v))
        })
        return itemHtml
      }).join('')
      rendered = rendered.replace(match, itemsHtml)
    }
  })
  
  return rendered
}

function toggleEditor() {
  showVisualEditor.value = !showVisualEditor.value
}
</script>
```

## Testing Strategy

### Unit Tests

```typescript
// tests/translations.test.ts
import { describe, it, expect } from 'vitest'
import { getTranslation, renderTemplate } from '~/server/utils/translations'

describe('Translation System', () => {
  it('should return system translation', async () => {
    const result = await getTranslation('en', 'common.save')
    expect(result).toBe('Save')
  })
  
  it('should return team override', async () => {
    const result = await getTranslation('en', 'common.save', 'team-123')
    expect(result).toBe('Submit') // Assuming team has override
  })
  
  it('should fallback to English', async () => {
    const result = await getTranslation('xx', 'common.save')
    expect(result).toBe('Save')
  })
  
  it('should render email template', () => {
    const template = 'Hello {{name}}, your order {{orderNumber}} is ready'
    const data = { name: 'John', orderNumber: '123' }
    const result = renderTemplate(template, data)
    expect(result).toBe('Hello John, your order 123 is ready')
  })
})
```

### Integration Tests

```typescript
// tests/api/translations.test.ts
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('Translation API', () => {
  await setup()
  
  it('should update team translations', async () => {
    const response = await $fetch('/api/teams/123/settings', {
      method: 'PATCH',
      body: {
        translations: {
          en: { 'common.save': 'Submit' }
        }
      }
    })
    
    expect(response.success).toBe(true)
  })
  
  it('should send email with correct language', async () => {
    const response = await $fetch('/api/test-email', {
      method: 'POST',
      body: {
        type: 'order_confirmation',
        locale: 'nl',
        to: 'test@example.com'
      }
    })
    
    expect(response.subject).toContain('Bestelling')
  })
})
```

## Migration Guide

### From Existing System

1. **Export existing translations** to JSON files
2. **Run migration** to add new tables
3. **Import team customizations** if any
4. **Update components** to use new `useT()` composable
5. **Test email sending** with different locales

### SQL Migrations

```sql
-- Add team settings table
CREATE TABLE IF NOT EXISTS team_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id TEXT NOT NULL UNIQUE,
  translations TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Add email templates table  
CREATE TABLE IF NOT EXISTS email_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id TEXT NOT NULL,
  type TEXT NOT NULL,
  translations TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, type),
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Add translations to content tables (example for products)
ALTER TABLE products ADD COLUMN translations TEXT;

-- Optional: Add generated columns for performance
ALTER TABLE products ADD COLUMN name_nl TEXT 
  GENERATED ALWAYS AS (json_extract(translations, '$.nl.name')) STORED;
  
CREATE INDEX idx_products_name_nl ON products(name_nl);
```

## Performance Considerations

### Caching Strategy

- **System translations**: Cached by Nuxt i18n module
- **Team overrides**: Cached in composable with reactive updates
- **Email templates**: No caching needed (infrequent reads)
- **Content translations**: Use generated columns for indexed locales

### Database Indexes

```sql
-- Essential indexes
CREATE INDEX idx_team_settings_team_id ON team_settings(team_id);
CREATE INDEX idx_email_templates_team_id ON email_templates(team_id);
CREATE INDEX idx_products_team_id ON products(team_id);

-- Performance indexes for frequently queried translations
CREATE INDEX idx_products_name_nl ON products(name_nl) WHERE name_nl IS NOT NULL;
CREATE INDEX idx_products_slug_nl ON products(slug_nl) WHERE slug_nl IS NOT NULL;
```

### Query Optimization

```typescript
// Efficient translation queries
const products = await db.select({
  id: products.id,
  // Use generated column for indexed locale
  name: locale === 'nl' 
    ? products.nameNl 
    : sql`COALESCE(
        json_extract(translations, '$.' || ${locale} || '.name'),
        name
      )`,
  price: products.price
})
.from(products)
.where(eq(products.teamId, teamId))
.limit(50)
```

## Monitoring & Maintenance

### Health Checks

```typescript
// server/api/health/translations.get.ts
export default defineEventHandler(async () => {
  const checks = {
    systemFiles: checkSystemTranslationFiles(),
    database: await checkDatabaseTables(),
    emailTemplates: await checkEmailTemplates()
  }
  
  return {
    status: Object.values(checks).every(c => c) ? 'healthy' : 'degraded',
    checks
  }
})
```

### Admin Dashboard Metrics

- Number of customized translations per team
- Most commonly overridden keys
- Email template usage statistics
- Missing translations report

## Security Considerations

1. **Input Validation**: Sanitize HTML in email templates
2. **XSS Prevention**: Escape user translations in UI
3. **Rate Limiting**: Limit translation API updates
4. **Permissions**: Team admins only can edit translations
5. **Audit Log**: Track translation changes

## Future Enhancements (When Needed)

1. **Translation Memory**: Reuse common translations
2. **Machine Translation**: Auto-translate with Google/DeepL
3. **Version History**: Track changes over time
4. **Collaboration**: Comments and suggestions
5. **Import/Export**: Bulk operations via CSV/Excel
6. **A/B Testing**: Test different translations

## Conclusion

This lightweight translation system provides:
- **Clear separation** between platform, workspace, and content translations
- **Simple implementation** with ~200 lines of core code
- **Consistent patterns** using JSON throughout
- **Good performance** with strategic indexing
- **Easy maintenance** with clear structure

The system can handle 3-5 languages efficiently and can be extended when needs grow, without over-engineering from the start.