# Translation System Implementation Briefing

## Current Status: Phase 1 - Database Schema Update

### What's Already Working
- ✅ Basic translation system with `translations_system` table
- ✅ Super-admin can add/edit/delete translations
- ✅ Sync to locale JSON files (en.json, nl.json, fr.json)
- ✅ `useT()` composable checks team overrides (stored in teamSettings)
- ✅ Basic UI at `/dashboard/super-admin/translations`

### What Needs Implementation

## PHASE 1: Database Schema Update (CURRENT)

### Task: Update the translations_system table to support multi-tenancy

**Location**: `/layers/translations/collections/system/server/database/schema.ts`

**Current Schema**:
```typescript
export const translationsSystem = sqliteTable('translations_system', {
  id: text('id').primaryKey().$default(() => nanoid()),
  userId: text('userId').notNull(),
  keyPath: text('keyPath').notNull().unique(),
  category: text('category').notNull(),
  values: text('values', { mode: 'json' }).notNull(),
  description: text('description'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$default(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$onUpdate(() => new Date())
})
```

**Required Changes**:
1. Add `teamId: text('teamId').nullable()` - null means system/default
2. Add `namespace: text('namespace').notNull().default('system')` - for organizing translations
3. Add `isOverrideable: integer('isOverrideable', { mode: 'boolean' }).notNull().default(true)`
4. Update unique constraint from `keyPath` to combination of `(teamId, namespace, keyPath)`

**Migration Required**:
- Run `pnpm db:generate` after schema change
- Existing records should get: `teamId: null, namespace: 'system', isOverrideable: true`

### UI Components to Use (Nuxt UI)
- Use existing `UButton`, `UCard`, `UTable` components
- Use `USelect` for namespace dropdown
- Use `UToggle` for isOverrideable flag
- MCP available: `mcp__nuxt-ui-remote__get_component` for component docs

### Important Files
- Schema: `/layers/translations/collections/system/server/database/schema.ts`
- API endpoints: `/layers/translations/collections/system/server/api/super-admin/translations-system/`
- UI Component: `/layers/translations/collections/system/app/components/List.vue`
- Composable: `/layers/translations/collections/system/app/composables/useTranslationsSystem.ts`

### Test After Completion
1. Database migration runs successfully
2. Existing translations still work
3. Can still sync to locale files
4. No breaking changes to current functionality

---

## NEXT PHASE: API Endpoints Update (After Schema is Done)
*Briefing will be updated after Phase 1 completion*

### Preview of Next Steps:
- Update all CRUD endpoints to handle teamId
- Add namespace filtering
- Create team-specific endpoints
- Update sync logic to respect teamId=null

---

## Technical Context
- **Framework**: Nuxt 3 with layers architecture
- **Database**: SQLite with Drizzle ORM
- **UI Library**: Nuxt UI (use MCP for component reference)
- **Auth**: User sessions with team membership
- **Existing Patterns**: CRUD operations use `/layers/crud/` components

## Key Principles
1. **Backwards Compatible**: Don't break existing functionality
2. **Progressive Enhancement**: Each phase should work independently
3. **Use Existing Patterns**: Follow the codebase conventions
4. **Lightweight**: ~200 lines of core code total
5. **Use Nuxt UI**: Leverage existing component library via MCP

## Files Modified So Far
1. ✅ `/layers/translations/collections/system/server/database/schema.ts` - Removed teamId requirement (now needs to be re-added as nullable)
2. ✅ `/layers/translations/collections/system/server/api/super-admin/translations-system/sync.post.ts` - Updated to merge instead of overwrite
3. ✅ `/layers/translations/collections/system/app/components/List.vue` - Added sync button

## Current User Flow
1. Super-admin goes to `/dashboard/super-admin/translations`
2. Can add/edit/delete translations
3. Click "Sync to Locale Files" to update JSON files
4. Translations available via `$t()` in components

## End Goal
- Teams can override specific translations
- Namespaces organize translations (system, pos, crud, etc.)
- Clear hierarchy: Team Override → Domain Default → System Default → Locale File