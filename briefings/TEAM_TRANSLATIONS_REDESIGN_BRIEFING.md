# Team Translations UX Redesign - Technical Briefing

## Problem Statement

Currently, when teams want to override system translations at `http://localhost:3000/dashboard/test/translations`, the UX flow is suboptimal:

1. Click "Create" button
2. Form opens with dropdown to search/select system translation
3. Select translation from dropdown
4. Form populates with system data
5. Edit translation values and save

**Issues identified:**
- Poor discoverability - teams can't browse available translations
- Extra friction - requires dropdown search/selection step
- Unintuitive - "Create" button doesn't clearly indicate "override" action
- Limited visibility - can't see which translations are already overridden

## Current vs Proposed Approach

### Current: Team Table Shows Only Overrides
- **Problem**: Sparse table showing only existing team overrides
- **Result**: Hard to discover what translations are available to customize
- **UX**: Create button → dropdown search → select → edit

### Proposed: System Translations with Override Column
- **Solution**: Show ALL system translations with "Your Override" column
- **Result**: Perfect discoverability + clear override status
- **UX**: See translation → click edit → done

## Proposed Solution: Enhanced System Table

### Visual Example

| KeyPath             | Category | System Values                      | Your Override                          | Actions  |
|---------------------|----------|------------------------------------|----------------------------------------|----------|
| auth.login.title    | Auth     | "Login" (en), "Connexion" (fr)     | "Sign In" (en), "Se connecter" (fr)    | Edit     |
| auth.register.title | Auth     | "Register" (en), "S'inscrire" (fr) | *(empty - using system)*               | Override |
| dashboard.welcome   | UI       | "Welcome" (en), "Bienvenue" (fr)   | "Welcome Back" (en) *(partial)*       | Edit     |

### Benefits of This Approach

✅ **Perfect discoverability** - See ALL available translations
✅ **Clear override status** - Instantly see what your team has customized
✅ **Direct comparison** - System value vs team override side by side
✅ **Familiar edit pattern** - Click edit on any row
✅ **Minimal complexity** - Just add one column to existing system table

### Current Component Structure
```
TeamList.vue
├── Uses CrudTable with collection="translationsUi"
├── Shows team overrides only (current approach)
├── CrudTableHeader with createButton
└── Uses useCollection('translationsUi') for data

Proposed:
├── Shows system translations with team override column
├── Remove createButton (edit buttons in table rows)
└── Uses enhanced endpoint with joined data
```

### API Endpoints

**Current Endpoints (unchanged):**
- Create override: `POST /api/teams/{teamSlug}/translations-ui`
- Update override: `PATCH /api/teams/{teamSlug}/translations-ui/{id}`
- Delete override: `DELETE /api/teams/{teamSlug}/translations-ui/{id}`

**New Enhanced Endpoint:**
- **Enhanced list**: `GET /api/teams/{teamSlug}/translations-ui/with-system`
  - Returns: System translations joined with team override data
  - Format: `{ keyPath, category, systemValues, teamValues, hasOverride, overrideId }`
  - Single query eliminates client-side merging complexity

### New User Experience
1. **Browse**: See complete system translations table with "Your Override" column
2. **Compare**: System values vs team overrides side by side
3. **Edit**: Click edit button on any row ("Edit" for overrides, "Override" for system defaults)
4. **Save**: Creates new override or updates existing one

## Technical Implementation Plan

### Phase 1: Backend Enhancement

**1. Create Enhanced Endpoint**
```javascript
// New API endpoint: GET /api/teams/{teamSlug}/translations-ui/with-system
// Returns system translations with team override data joined
{
  keyPath: 'auth.login.title',
  category: 'Auth',
  systemValues: { en: 'Login', fr: 'Connexion' },
  teamValues: { en: 'Sign In', fr: 'Se connecter' }, // null if no override
  hasOverride: true,
  overrideId: 123 // null if no override
}
```

**2. Database Query Enhancement**
```sql
-- Join system translations with team overrides
SELECT
  st.keyPath, st.category, st.values as systemValues,
  to.values as teamValues, to.id as overrideId,
  (to.id IS NOT NULL) as hasOverride
FROM system_translations st
LEFT JOIN team_overrides to ON st.keyPath = to.keyPath AND to.teamId = ?
```

### Phase 2: Frontend Updates

**1. Update TeamList.vue Data Source**
```javascript
// CHANGE FROM:
const { items: teamTranslations, pagination, refresh, pending: loading } = useCollection('translationsUi')

// TO: Use enhanced endpoint
const { items: enhancedTranslations, pagination, refresh, pending: loading } = useCollection('translationsUi', {
  apiPath: 'translations-ui/with-system'
})
```

**2. Update Table Columns**
```javascript
const columns = [
  { accessorKey: 'keyPath', header: 'KeyPath' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'systemValues', header: 'System Values' },
  { accessorKey: 'teamValues', header: 'Your Override' }, // NEW
  { accessorKey: 'actions', header: 'Actions' }
]
```

**3. Add Team Override Column**
```vue
<template #teamValues-cell="{ row }">
  <div v-if="row.original.hasOverride" class="text-sm">
    <TranslationDisplay :translations="row.original.teamValues" />
  </div>
  <div v-else class="text-gray-500 italic text-sm">
    (using system)
  </div>
</template>
```

**4. Smart Edit Button Logic**
```vue
<template #actions-cell="{ row }">
  <UButton
    @click="editTranslation(row.original)"
    icon="i-lucide-pencil"
    size="xs"
    variant="soft"
    :color="row.original.hasOverride ? 'orange' : 'primary'"
  >
    {{ row.original.hasOverride ? 'Edit' : 'Override' }}
  </UButton>
</template>
```

### Phase 3: Form Component Updates

**1. Remove Create Button from Table Header**
```vue
<!-- TeamList.vue: Remove createButton -->
<CrudTableHeader
  title="Team Translation Overrides"
  :collection="'translationsUi'"
  <!-- Remove createButton prop -->
/>
```

**2. Simplify editTranslation Logic**
```javascript
// TeamList.vue: Smart edit function
const editTranslation = (translation) => {
  if (translation.hasOverride) {
    // Edit existing team override
    open('update', 'translationsUi', [translation.overrideId])
  } else {
    // Create new team override - pre-populate with system data
    const newOverride = {
      keyPath: translation.keyPath,
      values: { ...translation.systemValues }, // Start with system values
      description: '' // Team can add custom description
    }
    openWithPrefilledData('create', 'translationsUi', newOverride)
  }
}
```

**3. Form.vue Enhancements**
```vue
<!-- Show system context for team mode -->
<div v-if="mode === 'team'" class="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
  <h4 class="text-sm font-semibold mb-2">System Translation</h4>
  <div class="space-y-1 text-sm text-gray-600">
    <div><span class="font-medium">KeyPath:</span> {{ state.keyPath }}</div>
    <div><span class="font-medium">Category:</span> {{ state.category }}</div>
  </div>
</div>

<!-- Remove dropdown for team mode (no longer needed) -->
```

### Phase 4: Collection Configuration Updates

**1. Update useTranslationsUi Composable**
```javascript
// useTranslationsUi.ts: Add enhanced columns
const ENHANCED_COLUMNS = [
  { accessorKey: 'keyPath', header: 'KeyPath' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'systemValues', header: 'System Values' },
  { accessorKey: 'teamValues', header: 'Your Override' },
  { accessorKey: 'actions', header: 'Actions' }
]
```

**2. Add Utility for Pre-filled Forms**
```javascript
// useCrud.ts: Simple helper for pre-filled create
const openWithPrefilledData = (action, collection, data) => {
  const newState = {
    action,
    collection,
    activeItem: { ...data }, // Pre-fill form
    loading: 'notLoading',
    isOpen: true
  }
  crudStates.value.push(newState)
}
```

## Implementation Benefits

### User Experience
- ✅ **Perfect discoverability**: Browse ALL available translations in one table
- ✅ **Instant comparison**: System values vs team overrides side by side
- ✅ **Clear visual status**: Immediately see what's customized vs default
- ✅ **Intuitive workflow**: See translation → Click edit → Done
- ✅ **Familiar pattern**: Standard table with enhanced information

### Technical Benefits
- ✅ **Minimal complexity**: Single enhanced endpoint eliminates client-side merging
- ✅ **Better performance**: One query instead of dual fetching
- ✅ **Consistent patterns**: Uses existing CRUD table infrastructure
- ✅ **Single source of truth**: Backend joins data, frontend displays it
- ✅ **Scalable approach**: Works for teams with 0 or 100+ overrides

## Migration Considerations

### Backward Compatibility
- ✅ Existing team overrides remain functional
- ✅ Current create/update/delete endpoints unchanged
- ✅ Form component maintains both system and team modes
- ✅ No database migration required
- ✅ Only adds one new read-only endpoint

### Testing Requirements
1. **Enhanced Table Display**: Verify system translations show with override status
2. **Create Override Flow**: Click "Override" → Form pre-fills → Save → Verify created
3. **Edit Override Flow**: Click "Edit" → Form loads existing → Save → Verify updated
4. **Visual Accuracy**: Verify "Your Override" column shows correct data
5. **Performance**: Test with large translation sets (100+ items)

## Files to Modify

### Backend Changes
- **NEW**: `/layers/translations/collections/ui/server/api/teams/[id]/translations-ui/with-system.get.ts`
  - Enhanced endpoint returning system translations joined with team overrides

### Frontend Changes
- `/layers/translations/collections/ui/app/components/TeamList.vue`
  - Update data source to use enhanced endpoint
  - Add "Your Override" column
  - Update edit button logic
  - Remove create button from header

- `/layers/translations/collections/ui/app/composables/useTranslationsUi.ts`
  - Add enhanced column definitions
  - Update any type definitions

- `/layers/crud/composables/useCrud.ts` *(minor)*
  - Add `openWithPrefilledData` helper function

## Success Metrics

### Qualitative Goals
- ✅ Users can browse ALL available translations without searching
- ✅ Crystal clear visual distinction: system default vs team override
- ✅ Instant understanding of current customization status
- ✅ One-click access to edit any translation

### Quantitative Improvements
- **Discoverability**: 100% of translations visible vs dropdown search
- **Click reduction**: 1 click (edit) vs 3+ clicks (create → search → select)
- **Cognitive load**: Side-by-side comparison vs mental context switching
- **Status visibility**: Immediate visual feedback vs hidden override status

### Implementation Complexity
- **Backend**: 1 new endpoint with simple JOIN query
- **Frontend**: 1 enhanced column + smart edit button
- **Total changes**: ~50 lines of code vs 300+ in original plan

## Implementation Checklist

### Phase 1: Backend Enhancement ⏳
- [ ] **Create new enhanced API endpoint**
  - [ ] Create `/layers/translations/collections/ui/server/api/teams/[id]/translations-ui/with-system.get.ts`
  - [ ] Implement JOIN query: system translations + team overrides
  - [ ] Return format: `{ keyPath, category, systemValues, teamValues, hasOverride, overrideId }`
  - [ ] Test endpoint manually with Postman/curl
  - [ ] Verify data structure matches frontend expectations

### Phase 2: Frontend Table Updates ⏳
- [ ] **Update TeamList.vue data source**
  - [ ] Change from `translations-ui` to `translations-ui/with-system`
  - [ ] Verify data loads correctly in browser dev tools
  - [ ] Test pagination/filtering still works
- [ ] **Add "Your Override" column**
  - [ ] Update columns configuration in `useTranslationsUi.ts`
  - [ ] Add `teamValues-cell` template slot in `TeamList.vue`
  - [ ] Show translation values or "(using system)" fallback
  - [ ] Test visual display with various override states
- [ ] **Update edit button logic**
  - [ ] Implement smart button text: "Edit" vs "Override"
  - [ ] Update button colors based on override status
  - [ ] Test click handlers for both create and update flows

### Phase 3: Form & UX Polish ⏳
- [ ] **Remove create button from header**
  - [ ] Remove `createButton` prop from `CrudTableHeader` in `TeamList.vue`
  - [ ] Verify no broken functionality
- [ ] **Add pre-filled create logic**
  - [ ] Add `openWithPrefilledData` helper to `useCrud.ts`
  - [ ] Implement `editTranslation` function with smart create/update logic
  - [ ] Test form pre-population for new overrides
  - [ ] Test form loading for existing overrides
- [ ] **Enhance Form.vue context display**
  - [ ] Add system translation info box for team mode
  - [ ] Show keyPath and category as read-only context
  - [ ] Test visual layout and styling

### Phase 4: Testing & Validation ✅
- [ ] **Functional Testing**
  - [ ] ✅ Browse: Table shows all system translations
  - [ ] ✅ Status: "Your Override" column shows correct data
  - [ ] ✅ Create: Click "Override" → Form pre-fills → Save → Override created
  - [ ] ✅ Edit: Click "Edit" → Form loads existing → Save → Override updated
  - [ ] ✅ Visual: Buttons show correct text and colors
- [ ] **Edge Case Testing**
  - [ ] ✅ Empty team (no overrides): All show "(using system)"
  - [ ] ✅ Partial overrides: Mix of custom and system translations
  - [ ] ✅ Large datasets: Performance with 100+ translations
  - [ ] ✅ Pagination: Override status preserved across pages
- [ ] **Cross-browser Testing**
  - [ ] ✅ Chrome/Safari/Firefox compatibility
  - [ ] ✅ Mobile responsive design
  - [ ] ✅ Dark mode compatibility

### Phase 5: Documentation & Cleanup 📝
- [ ] **Update Type Definitions**
  - [ ] Add TypeScript interfaces for enhanced data structure
  - [ ] Update component prop types if needed
- [ ] **Code Review Prep**
  - [ ] Remove any debugging code/comments
  - [ ] Ensure consistent code formatting
  - [ ] Add JSDoc comments for new functions
- [ ] **User Documentation**
  - [ ] Update internal team docs about new workflow
  - [ ] Create quick demo/screenshots if needed

---

*This simplified approach achieves all UX goals through elegant backend data joining rather than complex frontend merging, resulting in better performance and maintainability.*