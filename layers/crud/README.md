# CRUD Layer - Functional Programming Refactor

## Overview
The CRUD layer provides a generic, functional approach to handling Create, Read, Update, and Delete operations for collections in your Nuxt application.

## Core Principles
- **Pure Functions**: All transformations are pure functions without side effects
- **Immutability**: State is never mutated; new state is always returned
- **Composition**: Complex operations built from simple, composable functions
- **Type Safety**: TypeScript-first with proper type inference
- **Optimistic Updates**: Immediate UI feedback with automatic rollback on errors

## Architecture

### 1. Functional Utilities (`utils/functional.ts`)
Pure transformation functions for CRUD operations:
- `addOptimisticFlags()` - Add optimistic tracking to items
- `addToCollection()` - Immutably add items
- `updateInCollection()` - Immutably update items
- `removeFromCollection()` - Immutably remove items
- `replaceByOptimisticId()` - Replace optimistic items with server data
- Functional API helpers (`apiGet`, `apiPost`, `apiPatch`, `apiDelete`)

### 2. Collection Configuration Pattern
Each collection defines its configuration as a plain object:

```typescript
export const postsConfig = {
  name: 'posts',
  apiPath: 'posts',
  componentName: 'PostsForm',
  schema: z.object({ /* validation schema */ }),
  defaultValues: { /* default form values */ },
  columns: [ /* table columns */ ],
  transformForApi: (data) => data,  // Optional transform
  transformFromApi: (data) => data, // Optional transform
}
```

### 3. Collection Registry (`useCollections`)
- Automatically registers collections from their configs
- Creates reactive state for each collection
- Generates component mappings
- Single source of truth for collection metadata

### 4. CRUD Composable (`useCrud`)
Handles all CRUD operations using functional patterns:
- Optimistic updates with pure functions
- Generic API operations (no hardcoded fields)
- Automatic rollback on errors
- Functional composition of operations

## Usage

### Adding a New Collection

1. Create the collection config:
```typescript
// layers/collections/users/composables/useUsers.ts
export const usersConfig = {
  name: 'users',
  apiPath: 'users',
  componentName: 'UsersForm',
  schema: z.object({
    name: z.string().min(1),
    email: z.string().email()
  }),
  defaultValues: { name: '', email: '' },
  columns: [/* ... */]
}
```

2. Register in useCollections:
```typescript
// layers/collections/composables/useCollections.ts
import { usersConfig } from '../users/composables/useUsers'

const collectionConfigs = {
  posts: postsConfig,
  users: usersConfig, // Add here
}
```

3. Create the form component following the PostsForm pattern

## Benefits of This Approach

1. **Predictability**: Pure functions always return the same output for the same input
2. **Testability**: Easy to unit test pure functions
3. **Maintainability**: Clear separation of concerns and side effects
4. **Flexibility**: Easy to compose and extend functionality
5. **Performance**: Immutable updates enable efficient change detection

## API Flow

1. User triggers action → 
2. Optimistic update (pure function) → 
3. UI updates immediately → 
4. API call (side effect at boundary) → 
5. Replace optimistic item with server response (pure function) → 
6. On error: Rollback (pure function)

## Future Improvements

- Add memoization for expensive operations
- Implement undo/redo with state history
- Add middleware pipeline for transforms
- Support for batch operations
- Better TypeScript generics for type inference