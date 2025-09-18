# Task Brief: Fix the Big Table Component 🦣

## Problem Statement
We have a **MASSIVE** table component (`Table.vue`) that's 469 lines long and trying to do everything at once. Imagine trying to fix a bug in there - it's like finding a needle in a haystack! Three different code review agents all agreed: this component needs to be split up and cleaned.

## Current Issues (In Plain English)

### 🔴 **Critical Problems**
1. **It's HUGE** - 469 lines in one file (good components are ~150 lines max)
2. **No TypeScript** - Using old-school props without type checking
3. **Slow Search** - Filters on EVERY keystroke (imagine typing "hello" = 5 searches!)
4. **Copy-Paste Code** - Same search logic written twice
5. **Console.logs Everywhere** - These will spam production logs

### ⚠️ **Medium Problems**
1. **Mixed Icon Sets** - Using different icon libraries randomly
2. **No Error Handling** - If something fails, users see nothing
3. **Confusing State** - Pagination data comes from 3 different places

## The Solution (Simple Version)

Think of it like organizing a messy room. Instead of one giant pile, we create organized sections:

```
Before: 🗑️ One massive Table.vue doing everything

After: 📁 Organized components
├── Table.vue (main container - just coordinates others)
├── TableSearch.vue (search bar and filters)
├── TablePagination.vue (page numbers and controls)
├── TableActions.vue (delete, export buttons)
└── composables/
    ├── useTableData.ts (handles the data)
    └── useTableSearch.ts (search logic with debouncing)
```

## Implementation Steps (Do These In Order!)

### Phase 1: Fix Critical Issues 🚨
1. **Add TypeScript Types**
   - Define what props can be (no more guessing!)
   - Replace `Array` with `TableColumn[]`
   - Replace `Object` with proper interfaces

2. **Remove Console.logs**
   - Delete lines 175, 419, 446
   - Use proper error handling instead

3. **Fix Search Performance**
   - Add debouncing (wait 300ms after user stops typing)
   - Use VueUse's `useDebounceFn` helper

### Phase 2: Split the Monster 🔨
1. **Extract Search/Filter Logic**
   - Create `TableSearch.vue` component
   - Move search input and filter buttons
   - Pass search value back to parent

2. **Extract Pagination**
   - Create `TablePagination.vue` component
   - Move page numbers and "rows per page" dropdown
   - Keep pagination state in parent

3. **Extract Bulk Actions**
   - Create `TableActions.vue` component
   - Move delete button and column visibility dropdown

### Phase 3: Clean Up 🧹
1. **Consolidate Duplicate Code**
   - Create one search function, use it everywhere
   - Extract magic numbers to constants

2. **Add Error Handling**
   - Wrap async functions in try-catch
   - Show user-friendly error messages

3. **Standardize Icons**
   - Pick one icon set (Lucide OR Phosphor, not both)

## Code Examples

### Before (Bad) ❌
```typescript
// No types, just guessing
defineProps({
  columns: { type: Array, default: [] },
  rows: { type: Array, default: [] }
})

// Search on every keystroke - SLOW!
const searchedRows = computed(() => {
  return props.rows.filter(row => /* search logic */)
})
```

### After (Good) ✅
```typescript
// Clear types - know exactly what you're getting
interface Props {
  columns: TableColumn[]
  rows: DataRow[]
}
defineProps<Props>()

// Debounced search - FAST!
const search = ref('')
const debouncedSearch = useDebounceFn((value: string) => {
  // Search only after user stops typing
}, 300)
```

## Testing Plan

### What to Test
1. **Search** - Does debouncing work? (type fast, should only search once)
2. **Pagination** - Can you navigate pages?
3. **Selection** - Can you select/deselect rows?
4. **Sorting** - Does clicking headers sort correctly?

### Simple Test Example
```typescript
test('search debounces correctly', async () => {
  const wrapper = mount(TableSearch)
  const input = wrapper.find('input')

  // Type quickly
  await input.setValue('h')
  await input.setValue('he')
  await input.setValue('hel')

  // Should only emit once after 300ms
  await wait(400)
  expect(wrapper.emitted('search')).toHaveLength(1)
})
```

## Definition of Done ✅

You'll know you're finished when:
- [ ] Table.vue is under 200 lines
- [ ] All props have TypeScript types
- [ ] Search has debouncing (300ms delay)
- [ ] No console.log statements remain
- [ ] Each component has a single responsibility
- [ ] No duplicate code
- [ ] Error states show user-friendly messages
- [ ] Tests pass for search, pagination, and selection

## Tips for Junior Devs 💡

1. **Start Small** - Fix TypeScript types first (easiest win)
2. **Test As You Go** - Don't wait until the end
3. **Use VueUse** - Don't reinvent the wheel (it has helpers for everything!)
4. **Ask Questions** - If state management seems confusing, it probably is
5. **Keep It Simple** - Better to have 5 simple components than 1 complex one

## Red Flags to Avoid 🚩
- Don't create more god components while splitting
- Don't forget to remove the old code after extracting
- Don't skip the debouncing (it really matters for performance)
- Don't mix concerns (search logic shouldn't know about pagination)

Remember: **Good code is like a good recipe - each ingredient has its place, and you can easily find what you need!**

## Technical Details Reference

### File Location
- **Current Component**: `layers/crud/app/components/Table.vue`
- **Target Structure**: Split into multiple files in same directory

### Code Smell Report Summary
- **Total Lines**: 469 (Critical - should be < 150)
- **Type Coverage**: 0% (Critical - should be > 90%)
- **Console.logs**: 3 instances (lines 175, 419, 446)
- **Duplicate Code**: ~15% (target < 5%)
- **Error Handling**: ~20% (target > 80%)

### Architecture References
- **UI Framework**: Nuxt UI 4 (not v2/v3)
- **State Management**: Composables (no Pinia)
- **Icons**: Should use either Lucide or Phosphor consistently
- **Testing**: Vitest for unit tests, Playwright for E2E

## Related Documentation
- [Nuxt UI 4 Table Component](https://ui.nuxt.com/components/table)
- [VueUse Debouncing](https://vueuse.org/shared/useDebounceFn/)
- [TypeScript in Vue 3](https://vuejs.org/guide/typescript/composition-api.html)