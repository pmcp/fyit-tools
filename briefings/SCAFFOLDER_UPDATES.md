# Scaffolder Updates for Simplified CRUD System

## Overview

This document tracks the necessary changes to the scaffolder to support the simplified CRUD system that:
- Uses client-side data fetching (no SSR complexity)
- Supports server-side pagination for large datasets
- Maintains optimistic updates for instant UI feedback
- Provides a single source of truth (collections store)
- Works automatically in both super-admin and team contexts

## Current Scaffolder Pattern (OLD)

### List Component Generation

The scaffolder currently generates List components with this pattern:

```vue
<template>
  <CrudTable
    collection="layerItems"
    :columns="columns"
    :rows="collectionLayerItems"
  >
    <template #header>
      <CrudTableHeader ... />
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { columns } = useLayerItems()
const { layerItems: collectionLayerItems } = useCollections()

// Direct useFetch call
const { data: items, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/layer-items`,
  { watch: [currentTeam] }
)

// Manual assignment to collections store
if (items.value) {
  collectionLayerItems.value = items.value
}
</script>
```

### Problems with Current Pattern

1. **No server pagination support** - Missing server pagination props
2. **Manual store syncing** - Explicitly assigns to collections store
3. **Uses async/await with useFetch** - Unnecessary SSR complexity
4. **No auto-refresh on pagination changes** - Manual watcher needed

## New Scaffolder Pattern (TARGET)

### List Component Generation

The scaffolder should generate this pattern:

```vue
<template>
  <CrudTable
    collection="layerItems"
    :columns="columns"
    :rows="items"
    :server-pagination="true"
    :pagination-data="pagination"
    :refresh-fn="refresh"
  >
    <template #header>
      <CrudTableHeader ... />
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { columns } = useLayerItems()

// Single composable handles everything (NOT async)
const { items, pagination, refresh } = useCollection('layerItems')
</script>
```

### Key Changes

1. **Use `useCollection` composable** - Replaces direct useFetch
2. **NOT async** - useCollection is now synchronous (client-side only)
3. **Add pagination props** to CrudTable:
   - `:server-pagination="true"`
   - `:pagination-data="pagination"`
   - `:refresh-fn="refresh"`
4. **Remove manual store assignment** - useCollection handles this internally
5. **Auto-fetches on mount** - No need for manual initialization

## Required Scaffolder Updates

### 1. Update `list-component.mjs`

**File:** `/Scaffolder/scripts/generators/list-component.mjs`

**Changes needed:**

```javascript
export function generateListComponent(data, config = {}) {
  const { plural, pascalCasePlural, layerPascalCase, layer } = data
  const prefixedPascalCasePlural = `${layerPascalCase}${pascalCasePlural}`
  const prefixedCamelCasePlural = `${layer}${pascalCasePlural}`

  // Check for translations (keep existing logic)
  const translatableFields = config?.translations?.collections?.[plural] || []
  const hasTranslations = translatableFields.length > 0

  return `<template>
  <CrudTable
    collection="${prefixedCamelCasePlural}"
    :columns="columns"
    :rows="items"
    :server-pagination="true"
    :pagination-data="pagination"
    :refresh-fn="refresh"
  >
    <template #header>
      <CrudTableHeader
        title="${prefixedPascalCasePlural}"
        :collection="'${prefixedCamelCasePlural}'"
        createButton
      />
    </template>${translatableFields.map(field => `
    <template #${field}-data="{ row }">
      {{ t(row, '${field}') }}
    </template>`).join('')}
  </CrudTable>
</template>

<script setup lang="ts">${hasTranslations ? `
const { t } = useEntityTranslations()` : ''}
const { columns } = use${prefixedPascalCasePlural}()

// Single composable handles pagination and optimistic updates (NOT async)
const { items, pagination, refresh } = useCollection('${prefixedCamelCasePlural}')
</script>`
}
```

### 2. Update `composable.mjs`

**File:** `/Scaffolder/scripts/generators/composable.mjs`

Add default pagination configuration and context support:

```javascript
export const ${prefixedPlural}Config = {
  name: '${prefixedPlural}',
  apiPath: '${apiPath}',
  componentName: '${layerPascalCase}${pascalCasePlural}Form',
  schema: ${prefixedSingular}Schema,
  defaultValues: {
    ${data.fieldsDefault}
  },
  columns: ${prefixedPlural}Columns,
  // Add default pagination settings
  defaultPagination: {
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: 'desc'
  },
  // Optional: specify if collection should work in multiple contexts
  contexts: ['super-admin', 'team'] // or just ['super-admin'] for admin-only
}
```

### 3. Scaffolder Should Generate Context-Aware API Routes (Optional)

When scaffolding a new collection that needs both contexts, generate:

**Super-Admin Routes:**
- `/api/super-admin/[collection]/index.get.ts`
- `/api/super-admin/[collection]/index.post.ts`
- `/api/super-admin/[collection]/[id].patch.ts`
- `/api/super-admin/[collection]/[id].delete.ts`

**Team Routes:**
- `/api/teams/[id]/[collection]/index.get.ts`
- `/api/teams/[id]/[collection]/index.post.ts`
- `/api/teams/[id]/[collection]/[itemId].patch.ts`
- `/api/teams/[id]/[collection]/[itemId].delete.ts`

Both should have the same structure but different permission checks.

## Migration Guide for Existing Collections

### For Collections Using Old Pattern

1. **Replace async useFetch with useCollection:**
   ```javascript
   // OLD
   const { data: items, refresh } = await useFetch(...)
   if (items.value) {
     collectionItems.value = items.value
   }

   // NEW (NOT async)
   const { items, pagination, refresh } = useCollection('collectionName')
   ```

2. **Update CrudTable props:**
   ```vue
   <!-- OLD -->
   <CrudTable
     :rows="collectionItems"
   >

   <!-- NEW -->
   <CrudTable
     :rows="items"
     :server-pagination="true"
     :pagination-data="pagination"
     :refresh-fn="refresh"
   >
   ```

3. **Remove `await` keyword** - useCollection is synchronous
4. **Remove manual store syncing** - useCollection handles this internally

### Collections to Migrate (Priority Order)

1. **High Priority - Dual Context Collections** (migrate first)
   - translationsUi ✅ (List.vue done, TeamList.vue completed - 50% code reduction achieved)
   - Any collection used in both super-admin and team contexts

2. **High Traffic Collections**
   - users
   - teams
   - Collections with frequent CRUD operations

3. **Medium Priority**
   - Any collection with > 100 items
   - Collections that would benefit from pagination

4. **Low Priority** (can remain on old pattern)
   - Small, static collections
   - Admin-only collections with minimal usage

## Important API Requirements

For updates to work correctly, ensure API PATCH endpoints update ALL fields sent in the request body. Example:

```typescript
// API endpoint should update ALL provided fields
const updateData = {
  ...(body.keyPath && { keyPath: body.keyPath }),
  ...(body.category && { category: body.category }),
  ...(body.values && { values: body.values }),
  ...(body.description !== undefined && { description: body.description }),
  // ... other fields
  updatedAt: new Date(),
}
```

## Prerequisites

**IMPORTANT:** Before using the new scaffolder pattern, ensure:
- `useCrud.ts` line 79 is fixed to use team path with route params:
  ```javascript
  // OLD (broken):
  : `/api/${collection}`

  // NEW (fixed - uses route.params.team):
  : `/api/teams/${route.params.team}/${apiPath}`
  ```
- `getApiBasePath` function is also updated to use `route.params.team` instead of `currentTeam.value.id`

## Context-Aware Collections

The scaffolder generates collections that automatically work in multiple contexts:

### How It Works
- `useCollection('collectionName')` automatically detects context based on route
- Routes with `/super-admin/` → uses `/api/super-admin/[collection]`
- Routes with `/teams/` → uses `/api/teams/[teamId]/[collection]`
- No conditional logic needed in components - write once, use everywhere

### Requirements for Dual-Context Collections
- API endpoints must exist at both paths (super-admin and team)
- Both endpoints should support the same pagination params
- Response structure must be consistent between contexts
- Proper permission checks in each context

### Example: Same Code, Multiple Contexts
```vue
// This SAME component works in both super-admin and team contexts:
<script setup>
const { items, pagination, refresh } = useCollection('translationsUi')
</script>
```

Real-world proof: TeamList.vue migration showed **50% code reduction** by using this pattern.

## Testing Checklist

After updating the scaffolder, verify:

- [ ] New collections get server pagination by default
- [ ] Collection works in super-admin context
- [ ] Collection works in team context (if applicable)
- [ ] Pagination works in both contexts
- [ ] Optimistic updates show instant UI feedback
- [ ] Pagination controls work without infinite loops
- [ ] No SSR/hydration issues (we're client-side only now)
- [ ] Existing collections still work (backward compatible)
- [ ] Create, update, delete operations work correctly
- [ ] Updates persist after modal closes
- [ ] Translation fields still work if configured

## Architecture Summary

The simplified architecture:

```
User Action → Optimistic Update → API Call → Replace in Store
                    ↓
              Instant UI Update
```

Key differences from the old SSR approach:
- **No SSR complexity** - Everything is client-side
- **No refresh registration** - Components manage their own data
- **No data merging** - Single source of truth (collections store)
- **Simpler mental model** - Easier to understand and debug

## Benefits Summary

- **Simpler Code:** ~70% reduction in useCollection complexity
- **Write Once, Use Everywhere:** Same component works in all contexts
- **50% Less Code in Components:** Proven by TeamList.vue migration
- **Better DX:** Easier to understand and maintain
- **No SSR Issues:** No hydration mismatches or serialization problems
- **Single Source of Truth:** Collections store handles everything
- **Optimistic Updates:** Still work perfectly for instant feedback
- **Automatic Context Switching:** No conditional logic needed

## Recent Changes (September 15, 2025)

### Team ID Resolution Fix

**Problem:** `useCrud.ts` was using `currentTeam.value.id` which caused "Team not found" 404 errors.

**Solution:** Updated both `getCollection` and `getApiBasePath` functions to use `route.params.team` instead:

```javascript
// File: layers/crud/composables/useCrud.ts

// Line 79 - getCollection function
const fullApiPath = route.path.includes('/super-admin/')
  ? `/api/super-admin/${apiPath}`
  : `/api/teams/${route.params.team}/${apiPath}` // ✅ Fixed

// Line 35 - getApiBasePath function
const getApiBasePath = (apiPath: string) => {
  if (route.path.includes('/super-admin/')) {
    return `/api/super-admin/${apiPath}`
  }
  return `/api/teams/${route.params.team}/${apiPath}` // ✅ Fixed
}
```

### TeamList.vue Migration Completed

Successfully migrated `TeamList.vue` from manual fetching to `useCollection` pattern:

**Before:** 150 lines with manual state management
**After:** 63 lines using composable (58% reduction)

**Key Changes:**
- Replaced manual `$fetch()` with `useCollection('translationsUi')`
- Removed manual loading/error state management
- Added server pagination support props to CrudTable
- Updated template slots to use `row.original` instead of `row`

This proves the pattern works and provides significant code reduction.

### Form Mode Detection Fix

**Problem:** Team translation forms were loading in system mode instead of team mode because the route detection logic was incorrect.

**Root Cause:** `DynamicFormLoader.vue` was checking for `/teams/` in the URL, but the actual URLs are:
- Team: `/dashboard/test/translations`
- Admin: `/dashboard/super-admin/translations`

Neither URL contains `/teams/`, so both defaulted to system mode.

**Solution:** Updated the mode detection logic in `DynamicFormLoader.vue` line 43:

```javascript
// File: layers/crud/components/DynamicFormLoader.vue

const mode = computed(() => {
  if (props.collection === 'translationsUi') {
    // OLD (broken):
    return route.path.includes('/teams/') ? 'team' : 'system'

    // NEW (fixed):
    return route.path.includes('/super-admin/') ? 'system' : 'team'
  }
  return undefined
})
```

**Why This Works:**
- Matches existing patterns used in `useCrud.ts`
- No URL changes needed - works with current routing structure
- Correct behavior: URLs with `/super-admin/` → system mode, all others → team mode
- Future-proof for any team slug in `/dashboard/{team}/translations`

**Result:** Team translations now properly load in team mode with dropdown to select system translations to override.

## Notes

- The existing optimistic update system in `useCrud` is fully functional
- `useCollection` is now a simple client-side composable (47 lines vs 145 lines)
- The Table component handles pagination interactions
- Backward compatibility is maintained - old collections continue to work
- API endpoints must update all fields sent in the request body for updates to work
- Team ID is now correctly resolved from route parameters, not team context