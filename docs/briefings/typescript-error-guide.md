# TypeScript Error Handling Guide

## Overview
This guide explains how to handle common TypeScript errors in our Nuxt/Vue application, particularly those reported by `vue-tsc`.

## Common Error Types & Solutions

### 1. Implicit 'any' Type Errors

**Error Example:**
```
Parameter 'val' implicitly has an 'any' type.
```

**Solution:**
Add explicit type annotations to parameters:

```typescript
// ❌ Bad
@update:open="(val) => handleClose(state.id, val)"

// ✅ Good
@update:open="(val: boolean) => handleClose(state.id, val)"
```

### 2. Object Possibly 'undefined'

**Error Example:**
```
Object is possibly 'undefined'.
```

**Solution:**
Use optional chaining or null checks:

```typescript
// ❌ Bad
slideoverStates[index-1].action

// ✅ Good
slideoverStates[index-1]?.action
```

### 3. Type Mismatches

**Error Example:**
```
Type '"red"' is not assignable to type '"error" | "info" | "neutral" | "success" | "primary" | "secondary" | "warning" | undefined'.
```

**Solution:**
Use the correct enum values from Nuxt UI 4:

```typescript
// ❌ Bad (Nuxt UI v2/v3)
color: 'red'

// ✅ Good (Nuxt UI v4)
color: 'error'
```

### 4. Missing Function Arguments

**Error Example:**
```
Expected 3-5 arguments, but got 2.
```

**Solution:**
Check the function signature and provide all required arguments:

```typescript
// ❌ Bad
open('create', collection)

// ✅ Good
open('create', collection, undefined, undefined, metadata)
```

### 5. Self-Referencing Types

**Error Example:**
```
'table' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.
```

**Solution:**
Add explicit type annotations:

```typescript
// ❌ Bad
const table = useTemplateRef('table')

// ✅ Good
import type { ComponentPublicInstance } from 'vue'
const table = useTemplateRef<ComponentPublicInstance>('table')
```

## Quick Fixes by Component

### Container.vue
```typescript
// Add type for event handlers
@update:open="(val: boolean) => handleClose(state.id, val)"
@after:leave="() => handleAfterLeave(state.id)"

// Add null checks for array access
{{ slideoverStates[index-1]?.action }}
{{ slideoverStates[index-1]?.collection }}
```

### Table.vue
```typescript
// Type the table ref
import type { TableApi } from '@tanstack/vue-table'
const table = useTemplateRef<{ tableApi?: TableApi }>('table')

// Type row parameters
selectedRows.map((row: any) => row.id)

// Type column filters
.filter((column: any) => column.getCanHide())
.map((column: any) => ({
  label: upperFirst(column.id),
  type: 'checkbox' as const,
  checked: column.getIsVisible()
}))
```

### CrudEntitySelect.vue
```typescript
// Fix the open function call - check useCrud signature
const { open } = useCrud()
// Ensure you're passing the right number of arguments

// Fix error handling type
interface ApiError {
  message?: string
}
const error = response._data as ApiError
description: `Failed to fetch: ${error?.message || 'Unknown error'}`

// Use correct toast colors (Nuxt UI 4)
color: 'error' // not 'red'
```

### DevModeToggle.vue
```typescript
// Remove invalid toast properties
toast.add({
  title: 'Dev mode enabled',
  description: 'Click on [missing.key] translations to add them',
  color: 'primary'
  // timeout: 3000 // ← Remove this, not a valid property
})
```

## Running Type Checks

### Development Mode
```bash
# Type checking happens automatically in dev mode
pnpm dev
```

### Manual Type Check
```bash
# Run TypeScript checking
npx nuxt typecheck

# Watch mode for continuous checking
npx nuxt typecheck --watch
```

### Pre-commit Check
```bash
# Add to your pre-commit hook
npx nuxt typecheck --no-emit
```

## Configuring TypeScript Strictness

In `nuxt.config.ts`:
```typescript
export default defineNuxtConfig({
  typescript: {
    strict: true, // Enable strict mode
    typeCheck: true, // Enable type checking in dev
    shim: false // Disable shims for better type inference
  }
})
```

In `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

## Suppressing Errors (Use Sparingly!)

### Inline Suppression
```typescript
// @ts-ignore - Temporary fix until types are updated
const value = someUntypedLibrary.method()

// @ts-expect-error - We know this works at runtime
const result = hackyButWorkingSolution()
```

### File-level Suppression
```typescript
// @ts-nocheck
// Only use this for generated files or temporary migrations
```

## Best Practices

1. **Fix, Don't Suppress**: Always try to fix the type error rather than suppressing it
2. **Use Strict Mode**: Enable strict TypeScript checking to catch issues early
3. **Type Your Refs**: Always provide types for template refs and reactive refs
4. **Check Nuxt UI Version**: Ensure you're using Nuxt UI 4 APIs, not v2/v3
5. **Use Type Imports**: Import types explicitly with `import type`
6. **Validate API Responses**: Type your API responses to catch mismatches early

## Common Nuxt UI 4 Migration Issues

### Colors
```typescript
// Old (v2/v3)
'red', 'green', 'blue'

// New (v4)
'error', 'success', 'primary', 'secondary', 'neutral', 'warning', 'info'
```

### Components
```typescript
// Old (v2/v3)
UNotification, UToggle, UDivider

// New (v4)
UToast, USwitch, USeparator
```

### Toast API
```typescript
// Correct usage
const toast = useToast()
toast.add({
  title: 'Title',
  description: 'Description',
  color: 'success', // Use valid color
  // No 'timeout' property - use global config instead
})
```

## Getting Help

1. Check the [Nuxt UI 4 Documentation](https://ui.nuxt.com)
2. Verify component props with `npx nuxt typecheck`
3. Use IDE TypeScript features (hover for types, go to definition)
4. Check `node_modules/@nuxt/ui/dist/runtime/types` for component types

## Priority Fixes

When you see multiple TypeScript errors:

1. **First**: Fix type mismatches (wrong colors, properties)
2. **Second**: Add missing type annotations
3. **Third**: Handle possibly undefined values
4. **Last**: Consider refactoring if the type system is fighting you

Remember: TypeScript errors won't stop your dev server, but fixing them prevents runtime bugs!