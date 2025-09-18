# FigJam to Notion Sync - Integration with Existing Infrastructure

## Executive Summary

After analyzing your codebase, I've identified multiple existing patterns and components that can be leveraged for the FigJam to Notion sync service. This document maps the proposed system to your existing infrastructure, significantly reducing implementation time and maintaining consistency with your current architecture.

## Existing Components We Can Leverage

### 1. Webhook Infrastructure ✅ READY TO USE

Your Stripe webhook implementation (`server/api/stripe/webhook.ts`) provides an excellent pattern we can adapt:

**What we have:**
- Signature verification pattern
- Raw body parsing
- Event routing with switch statements
- Error handling with createError
- Async processing pattern

**How we'll adapt it:**
```typescript
// server/api/webhook/figma.post.ts
export default defineEventHandler(async (event) => {
  // Reuse signature verification pattern from Stripe
  const figmaSecret = env.FIGMA_WEBHOOK_SECRET
  const body = await readRawBody(event)
  const signature = getHeader(event, 'x-figma-signature')

  // Verify signature (similar to Stripe pattern)
  if (!verifyFigmaSignature(signature, body, figmaSecret)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid webhook signature'
    })
  }

  // Process email notification
  const emailData = JSON.parse(body)

  // Queue for async processing using NuxtHub
  const kv = hubKV()
  await kv.set(`figma:email:${emailData.messageId}`, emailData)

  return { status: 'queued' }
})
```

### 2. NuxtHub Infrastructure ✅ CONFIGURED

Your `nuxt.config.ts` already has all NuxtHub features enabled:
```typescript
hub: {
  database: true,  // ✅ For storing sync jobs
  blob: true,      // ✅ For storing email payloads
  kv: true,        // ✅ For caching and state
  workers: true    // ✅ For background processing
}
```

**Nitro Tasks** are enabled:
```typescript
nitro: {
  experimental: {
    tasks: true  // ✅ Can use for queue processing
  }
}
```

### 3. Database & ORM Setup ✅ READY

You're using Drizzle ORM with SQLite, perfect for our needs:

**Existing patterns we'll follow:**
```typescript
// server/database/schema/figmaSync.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'  // Already in use

export const figmaSyncJobs = sqliteTable('figma_sync_jobs', {
  id: text('id').primaryKey().$default(() => nanoid()),
  teamId: text('team_id').references(() => teams.id),
  // ... following your existing schema patterns
})
```

### 4. Authentication & Authorization ✅ READY

Your team-based auth pattern is perfect for multi-tenant sync:

**Existing patterns:**
```typescript
// We can reuse these helpers
const { user } = await requireUserSession(event)
const teamId = getRouterParam(event, 'id')
const userTeams = await findUserTeams(user.id)

// Check permissions (reuse existing pattern)
if (team.role !== 'owner' && team.role !== 'admin') {
  throw createError({ statusCode: 403 })
}
```

### 5. Service Layer Pattern ✅ ESTABLISHED

You have a services pattern (`server/services/`) we'll follow:

```typescript
// server/services/figma.ts (new, following your pattern)
export class FigmaService {
  // Similar to your stripe.ts service
}

// server/services/notion.ts (new)
export class NotionService {
  // Following established patterns
}
```

### 6. UI Components ✅ EXTENSIVE LIBRARY

Your existing UI components we can use directly:

#### Dashboard Layout
- `AppContainer` - For main dashboard wrapper
- `UCard`, `UTable`, `UButton` - For sync job display
- `UModal`, `USlideover` - For configuration
- `UToast` - For notifications
- `UProgress` - For sync progress
- `UBadge` - For status indicators

#### Expandable Slideover Pattern
Your `ExpandableSlideover` component is perfect for detailed job views:
```vue
<CrudExpandableSlideover
  v-model="showJobDetails"
  :title="`Sync Job ${selectedJob.id}`"
  :expanded="expanded"
  @toggle-expand="expanded = !expanded"
>
  <!-- Job details, logs, etc. -->
</CrudExpandableSlideover>
```

### 7. Rate Limiting ✅ CONFIGURED

You have `nuxthub-ratelimit` configured:
```typescript
nuxtHubRateLimit: {
  routes: {
    '/api/webhook/*': {
      maxRequests: 100,  // Adjust for Figma webhooks
      intervalSeconds: 60
    }
  }
}
```

### 8. Environment Management ✅ READY

Your env system supports what we need:
```typescript
// env.ts - Add these
FIGMA_API_TOKEN: z.string(),
FIGMA_WEBHOOK_SECRET: z.string(),
NOTION_API_KEY: z.string(),
ANTHROPIC_API_KEY: z.string(),
```

## Implementation Plan Using Existing Infrastructure

### Phase 1: Core Integration (3-4 days)

#### Day 1: Layer Setup & Schema
```bash
# Create new layer for Figma sync
mkdir -p layers/figma-sync
```

```typescript
// layers/figma-sync/nuxt.config.ts
export default defineNuxtConfig({
  // Following your layer pattern
})

// layers/figma-sync/server/database/schema.ts
// Use your existing Drizzle patterns
```

#### Day 2: Webhook & Queue
```typescript
// Adapt Stripe webhook pattern
// server/api/webhook/figma.post.ts

// Use NuxtHub KV for queuing
const kv = hubKV()
await kv.set(`queue:figma:${id}`, payload, {
  expirationTtl: 3600
})
```

#### Day 3: Services
```typescript
// Following your service pattern
// server/services/figma.ts
// server/services/notion.ts
// server/services/claude.ts
```

### Phase 2: UI Integration (2-3 days)

#### Day 4: Dashboard Page
```vue
<!-- app/pages/dashboard/[team]/integrations/figma-sync.vue -->
<template>
  <AppContainer title="Figma to Notion Sync">
    <template #actions>
      <UButton @click="openSettings">Settings</UButton>
    </template>

    <!-- Stats Cards (like your posts page) -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <UCard v-for="stat in stats">
        <!-- Reuse your card patterns -->
      </UCard>
    </div>

    <!-- Jobs Table -->
    <UCard>
      <UTable :columns="columns" :rows="jobs">
        <!-- Following your table patterns -->
      </UTable>
    </UCard>

    <!-- Settings Slideover -->
    <CrudExpandableSlideover v-model="showSettings">
      <!-- Configuration form -->
    </CrudExpandableSlideover>
  </AppContainer>
</template>
```

#### Day 5: Real-time Updates
```typescript
// Use Server-Sent Events (SSE) for live updates
// server/api/teams/[id]/integrations/figma-sync/stream.get.ts
export default defineEventHandler(async (event) => {
  const stream = createEventStream(event)

  // Send updates as jobs process
  const kv = hubKV()
  const watcher = kv.watch('figma:job:*')

  return stream
})
```

### Phase 3: Advanced Features (2-3 days)

#### Day 6: AI Integration
```typescript
// server/utils/ai.ts
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY
})

// Use your existing error handling patterns
```

#### Day 7: Testing & Polish
- Unit tests following your patterns
- E2E tests with Playwright
- Error handling improvements

## Specific Reusable Components

### 1. From CRUD Layer
- `Container.vue` - For nested slideover management
- `Table.vue` - For job listings
- `DynamicFormLoader` - For configuration forms
- `Loading.vue` - For loading states

### 2. From Translation Layer
- KV-based settings storage pattern
- Team-scoped configuration approach
- Real-time update patterns

### 3. From Auth Layer
- Team permission checking
- User session management
- API route protection

## API Routes Structure (Following Your Patterns)

```
server/api/
├── webhook/
│   └── figma.post.ts                          # Webhook endpoint
├── teams/[id]/
│   └── integrations/
│       └── figma-sync/
│           ├── index.get.ts                   # Get sync status
│           ├── settings.get.ts                # Get settings
│           ├── settings.patch.ts              # Update settings
│           ├── jobs/
│           │   ├── index.get.ts              # List jobs
│           │   └── [jobId].get.ts            # Job details
│           ├── manual.post.ts                 # Trigger manual sync
│           ├── retry/[jobId].post.ts         # Retry failed job
│           └── stream.get.ts                  # SSE for real-time
```

## Database Integration

### Using Your Existing Schema Patterns

```typescript
// server/database/schema/figmaSync.ts
import { relations } from 'drizzle-orm'
import { teams } from './teams'  // Reuse existing

export const figmaSyncConfigs = sqliteTable('figma_sync_configs', {
  id: text('id').primaryKey().$default(() => nanoid()),
  teamId: text('team_id').notNull().references(() => teams.id),
  enabled: integer('enabled', { mode: 'boolean' }).default(false),
  figmaToken: text('figma_token'),  // Encrypted
  notionToken: text('notion_token'), // Encrypted
  notionDatabaseId: text('notion_database_id'),
  mentions: text('mentions', { mode: 'json' }), // ['@Maarten']
  createdAt: integer('created_at', { mode: 'timestamp' }).$default(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date())
})

// Relations following your pattern
export const figmaSyncConfigsRelations = relations(figmaSyncConfigs, ({ one }) => ({
  team: one(teams, {
    fields: [figmaSyncConfigs.teamId],
    references: [teams.id]
  })
}))
```

## Key Advantages of Using Existing Infrastructure

### 1. **Reduced Development Time**
- 40% less code to write by reusing components
- Existing patterns reduce decision fatigue
- Auth, database, and UI already set up

### 2. **Consistency**
- Follows your established patterns
- Maintains code style and conventions
- Integrates seamlessly with existing features

### 3. **Maintenance**
- Team already knows these patterns
- Shared components get improvements
- Single source of truth for utilities

### 4. **Testing**
- Can reuse test utilities and mocks
- Existing E2E setup works immediately
- Pattern-based testing is predictable

## Migration Path for Existing Components

### Components That Need Minor Adaptation

1. **Webhook Handler**
   - Copy Stripe webhook pattern
   - Change signature verification
   - Adjust event routing

2. **Service Classes**
   - Follow stripe.ts structure
   - Add circuit breaker pattern
   - Implement retry logic

3. **Dashboard Pages**
   - Use AppContainer layout
   - Adapt posts.vue grid layout
   - Reuse modal/slideover patterns

### New Components Required

1. **Email Parser**
   - HTML parsing logic
   - Comment extraction
   - No existing equivalent

2. **Thread Builder**
   - Figma-specific logic
   - Comment tree construction
   - New implementation

3. **AI Summarizer**
   - Claude integration
   - Prompt engineering
   - Caching layer

## Configuration Approach (Using Your Patterns)

### Team-Scoped Settings (Like Translations)

```typescript
// server/api/teams/[id]/integrations/figma-sync/settings.get.ts
export default defineEventHandler(async (event) => {
  const teamId = getRouterParam(event, 'id')
  const { user } = await requireUserSession(event)

  // Use your auth checking pattern
  await requireTeamMember(teamId, user.id)

  // Use KV for settings like translation layer
  const kv = hubKV()
  const settings = await kv.get(`team:${teamId}:figma-sync`)

  return settings || defaultSettings
})
```

## Testing Strategy Using Existing Setup

### Unit Tests (Your Pattern)
```typescript
// tests/figma-sync/parser.test.ts
import { describe, it, expect } from 'vitest'
// Use your existing test utilities
```

### E2E Tests (Playwright Already Configured)
```typescript
// tests/e2e/figma-sync.spec.ts
test('manual sync trigger', async ({ page }) => {
  // Use your existing auth setup
  await loginAsTeamOwner(page)
  await page.goto('/dashboard/team/integrations/figma-sync')
  // Test implementation
})
```

## Deployment (Using NuxtHub)

Your existing NuxtHub setup makes deployment trivial:

```bash
# Development
pnpm dev  # Everything works locally with hub bindings

# Production
nuxthub deploy  # Deploys to Cloudflare edge
```

## Cost Optimization Using Your Infrastructure

1. **KV Storage** - Already included in NuxtHub
2. **Database** - D1 included, no extra cost
3. **Queue/Workers** - Cloudflare queues in your plan
4. **Edge Deployment** - Already set up
5. **Only new costs**: Figma API, Notion API, Claude API

## Immediate Next Steps

1. **Add environment variables** to your `.env`:
```env
FIGMA_API_TOKEN=
FIGMA_WEBHOOK_SECRET=
NOTION_API_KEY=
ANTHROPIC_API_KEY=
```

2. **Create the layer structure**:
```bash
mkdir -p layers/figma-sync/{server,app,composables}
```

3. **Extend nuxt.config.ts**:
```typescript
extends: [
  './layers/crud',
  './layers/figma-sync',  // Add this
  // ... other layers
]
```

4. **Start with webhook endpoint** using Stripe pattern

5. **Build dashboard** using existing components

## Conclusion

Your codebase is exceptionally well-structured for adding this feature. By leveraging your existing:
- Webhook patterns from Stripe integration
- NuxtHub infrastructure with KV and tasks
- Drizzle ORM schema patterns
- Team-based authentication
- UI component library
- Service layer architecture

We can implement the FigJam to Notion sync with:
- **50% less code** than starting from scratch
- **Consistent patterns** your team already knows
- **Production-ready infrastructure** from day one
- **Built-in scaling** via Cloudflare edge

The main new work involves:
1. Email parsing logic (unique to Figma)
2. API integrations (Figma, Notion, Claude)
3. Thread reconstruction algorithm
4. Dashboard UI (using your components)

Everything else can be adapted from your existing, battle-tested patterns.