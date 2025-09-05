# CRUD Layer - Architecture Overview

## Introduction

The CRUD layer provides a unified, reusable abstraction for Create, Read, Update, and Delete operations across different data collections in your Nuxt application. It implements functional programming principles with TypeScript to ensure type safety, maintainability, and consistent behavior across all entities (posts, tasks, users, etc.).

## Architecture Components

### Core Components

1. **Collections** (`posts`, `tasks`, etc.) - Entity-specific configurations and schemas
2. **CRUD Layer** - Centralized state management and orchestration logic
3. **Components** - UI elements (forms, tables, modals) that interact with the CRUD layer
4. **Composables** - Reactive state management using Vue 3 composition API
5. **API Layer** - RESTful endpoints for server communication
6. **Database** - Persistent storage layer

### Request Flow Example: Creating a New Post

```
1. User initiates action
   └─> CrudTableHeader component triggers action
   
2. Open modal with form
   └─> useCrud().open('create', 'posts', [])
   
3. CRUD state updates:
   └─> action = 'create'
   └─> activeCollection = 'posts'
   └─> showCrud = true
   
4. Container component renders modal:
   └─> Dynamically loads PostsForm component
   
5. Form component initializes:
   └─> Renders input fields based on schema
   └─> Applies validation rules
   
6. User submits form data
   └─> useCrud().send('create', 'posts', formData)
   
7. Optimistic update executes:
   └─> Temporary item added to collection with optimisticId
   └─> UI updates immediately
   └─> Async API call initiated
   
8. Server processes request:
   └─> Validates and persists data
   └─> Returns created entity with ID
   
9. State reconciliation:
   └─> Replace optimistic item with server response
   └─> Display success notification
   └─> Close modal
```

## Component Responsibilities

### CRUD Layer (`layers/crud/`)
**Core Responsibilities:**
- Modal state management and lifecycle
- Action coordination (create/update/delete)
- Optimistic update implementation
- Loading states and error handling
- Toast notifications

### Collections (`layers/collections/[entity]/`)
**Entity-Specific Logic:**
- Schema definition (Zod validation)
- Form component implementation
- List/table view components
- Custom business logic
- API endpoint configuration

### Integration Pattern
```typescript
// Collection defines the "what"
const postSchema = z.object({ title: z.string(), content: z.string() })

// CRUD handles the "how"
useCrud().send('create', 'posts', validatedData)
```

## Core Principles

- **Pure Functions**: Predictable, testable functions without side effects
- **Immutability**: State updates through new object creation, not mutation
- **Composition**: Complex features built from simple, reusable functions
- **Type Safety**: Full TypeScript coverage with strict typing
- **Optimistic Updates**: Immediate UI feedback with background synchronization

## Technical Architecture

### 1. Functional Utilities (`utils/functional.ts`)
**Pure utility functions for collection manipulation:**
- `addToCollection()` - Immutably add items
- `removeFromCollection()` - Immutably remove items
- `updateInCollection()` - Immutably update items
- `findInCollection()` - Safe item lookup

### 2. Collection Configuration
```typescript
interface CollectionConfig {
  name: string           // Collection identifier
  schema: ZodSchema      // Validation schema
  defaultValues: object  // Form initialization
  columns: Column[]      // Table display config
  apiPath?: string       // Custom API endpoint
}
```

### 3. Collection Registry (`useCollections`)
- Central registry for all available collections
- Dynamic component resolution
- Schema and configuration lookup

### 4. CRUD Composable (`useCrud`)
- Orchestrates all CRUD operations
- Manages modal and form state
- Handles optimistic updates and rollbacks
- Coordinates with API layer

## Implementation Details

### Opening a Form
```javascript
// API call
open('create', 'posts', [])

// Internal execution
1. Set action = 'create'
2. Set activeCollection = 'posts'
3. Set showCrud = true
4. Modal slides open
5. Find PostsForm component
6. Show empty form
```

### Optimistic Update Implementation
```typescript
// API call
send('create', 'posts', formData)

// Execution flow:
1. CREATE OPTIMISTIC ENTRY
   └─> Generate optimisticId: 'temp_[uuid]'
   └─> Add to collection state immediately
   └─> Set loading indicator

2. ASYNC API CALL
   └─> POST /api/teams/{teamId}/posts
   └─> Server validation and persistence
   └─> Return created entity

3. STATE RECONCILIATION
   └─> Match by optimisticId
   └─> Replace with server response
   └─> Clear loading state

4. ERROR HANDLING
   └─> Rollback optimistic entry
   └─> Display error notification
   └─> Maintain form state for retry
```

## Implementation Guide

### Adding a New Collection (Example: Tasks)

```
Step 1: Create collection structure
├── layers/collections/tasks/
│   ├── app/
│   │   ├── components/
│   │   │   ├── Form.vue    # Task form component
│   │   │   └── List.vue    # Task list/table view
│   │   └── composables/
│   │       └── useTasks.ts # Task-specific logic
│   └── types.ts            # TypeScript definitions

Step 2: Register in Nuxt config
// nuxt.config.ts
export default defineNuxtConfig({
  extends: [
    './layers/crud',
    './layers/collections',
    './layers/collections/tasks'
  ]
})

Step 3: Use components
<TasksList />  // Renders task table
<TasksForm />  // Form component (managed by CRUD layer)
```

### Out-of-the-Box Features
- Create, Read, Update, Delete operations
- Automatic form generation from schema
- Built-in validation (Zod)
- Loading and error states
- Toast notifications
- Optimistic UI updates
- Modal lifecycle management
- TypeScript type inference
- API integration
- State persistence

## Benefits

### User Experience
- **Performance**: Instant feedback through optimistic updates
- **Consistency**: Uniform behavior across all entities
- **Reliability**: Graceful error handling and recovery

### Developer Experience
- **Reduced Boilerplate**: Reusable CRUD operations
- **Type Safety**: Full TypeScript support with inference
- **Maintainability**: Consistent patterns and structure
- **Testability**: Pure functions and clear separation of concerns
- **Scalability**: Easy to add new collections

## FAQ

### Why use optimistic updates?
Optimistic updates provide immediate visual feedback, creating a responsive user experience. Instead of waiting for server confirmation, the UI updates instantly while the actual request processes in the background.

### How are failures handled?
When a server request fails:
1. The optimistic entry is automatically rolled back
2. An error notification is displayed
3. The form maintains its state for easy retry
4. No data corruption occurs

### Customization options
- **Schema modifications**: Update Zod schema for field changes
- **UI customization**: Modify Form.vue and List.vue components
- **Validation rules**: Extend or override Zod schemas
- **API endpoints**: Configure custom paths in collection config
- **Business logic**: Add custom composables and utilities

## System Architecture

```
   APPLICATION
      ↓
[Collections Layer]
  - Entity definitions
  - Business logic
      ↓
[CRUD Layer]
  - State management
  - Operation orchestration
      ↓
[API Layer]
  - RESTful endpoints
  - Request/response handling
      ↓
[Database]
  - Data persistence
  - ACID compliance
```

## Summary

The CRUD layer provides a robust, type-safe foundation for data operations in your Nuxt application. By abstracting common patterns and implementing best practices like optimistic updates and functional programming, it enables rapid feature development while maintaining code quality and user experience.

### Key Takeaways
1. **Separation of Concerns**: Clear boundaries between UI, state, and data layers
2. **Reusability**: One pattern for all CRUD operations
3. **Performance**: Optimistic updates for instant feedback
4. **Reliability**: Comprehensive error handling and rollback
5. **Maintainability**: Consistent structure and TypeScript support