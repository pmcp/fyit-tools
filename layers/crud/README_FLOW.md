# How the CRUD Flow Works - A Human Guide

## Overview

This CRUD system is like a well-oiled machine that handles all your Create, Read, Update, and Delete operations. It's designed to be fast, responsive, and user-friendly by using **optimistic updates** - showing changes instantly while handling the server work in the background.

## The Key Players

1. **Collections** - Your data types (posts, tasks, users, etc.)
2. **CRUD Composable** - The brain that orchestrates everything
3. **Components** - The UI pieces users interact with
4. **API Endpoints** - Server-side handlers for database operations
5. **Optimistic Updates** - The magic that makes everything feel instant

## The Complete Flow - What Happens When...

### 📋 When You View a List

```
User opens a page with <PostsList />
    ↓
1. List component fetches data from API
2. API checks user has team access
3. Database returns all posts for that team
4. Data stored in global collection state
5. List renders with CrudTable component
6. Each row gets Edit/Delete buttons
```

**What users see**: A table of their data with action buttons

### ✏️ When You Click "Create"

```
User clicks "New Post" button
    ↓
1. CrudTableHeader triggers open('create', 'posts', [])
2. CRUD sets action='create', activeItem={}
3. Container modal slides open
4. DynamicFormLoader finds PostsForm component
5. Form initializes with empty/default values
6. User fills in the form
```

**What users see**: A slide-over form ready for input

### 💾 When You Submit a Create Form

```
User clicks "Save" on create form
    ↓
1. Form calls send('create', 'posts', formData)
2. Optimistic update:
   - Creates temporary item with optimisticId
   - Adds to collection immediately
   - UI shows new item (with loading indicator)
3. API call happens in background:
   - POST to /api/teams/[id]/posts
   - Server validates and saves to database
   - Returns real item with real ID
4. Replace optimistic item with real item
5. Show success toast
6. Close modal
```

**What users see**: 
- Form closes immediately
- New item appears in list with skeleton loader
- Skeleton replaced with real data
- Success notification

### 🔄 When You Click "Edit"

```
User clicks edit button on a row
    ↓
1. Table triggers open('update', 'posts', [postId])
2. CRUD fetches full item data from API
3. Stores in activeItem
4. Container modal opens
5. Form pre-fills with current values
6. User makes changes
```

**What users see**: Form with current data ready to edit

### 💾 When You Submit an Update

```
User clicks "Save" on edit form
    ↓
1. Form calls send('update', 'posts', updatedData)
2. Optimistic update:
   - Updates item in collection immediately
   - Adds optimisticAction flag
   - UI reflects changes instantly
3. API call in background:
   - PATCH to /api/teams/[id]/posts/[postId]
   - Server validates & updates database
   - Returns updated item
4. Replace optimistic with server response
5. Success toast
6. Close modal
```

**What users see**:
- Changes appear instantly in the list
- Form closes
- Success notification

### 🗑️ When You Delete Items

```
User selects items and clicks delete
    ↓
1. Table triggers open('delete', 'posts', [id1, id2, ...])
2. Modal shows with delete confirmation
3. User confirms deletion
4. Optimistic update:
   - Removes items from collection immediately
   - UI updates instantly
5. API calls in background:
   - DELETE to /api/teams/[id]/posts/[postId] for each
   - Server deletes from database
6. Success toast
7. Close modal
```

**What users see**:
- Items disappear immediately
- Success notification

## The Magic: Optimistic Updates

### What Are They?

Instead of:
1. Click save → Show spinner → Wait for server → Update UI

We do:
1. Click save → Update UI immediately → Server works in background

### How It Works

```javascript
// Simplified flow
1. User submits form
2. Apply change to local state immediately:
   - Add optimisticId and optimisticAction flags
   - Update the collection array
3. UI re-renders with new data
4. Meanwhile, send to server
5. When server responds, replace optimistic item
6. If error, rollback the optimistic change
```

### Visual Indicators

- **Creating**: New item shows with skeleton/loading state
- **Updating**: Item shows with subtle loading indicator
- **Deleting**: Item disappears immediately
- **Error**: Item returns with error message

## Component Communication

```
┌─────────────────────────────────────────┐
│            User Interaction             │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│          List Component                 │
│  (PostsList, TasksList, etc.)           │
│  - Displays data                        │
│  - Has create/edit/delete buttons       │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│          useCrud() Composable           │
│  - Manages state (showCrud, action)     │
│  - Handles open/close                   │
│  - Performs optimistic updates          │
│  - Makes API calls                      │
└────────┬───────────────┬────────────────┘
         ↓               ↓
┌─────────────────────────────────────────┐
│     Container          │   Form          │
│  (Modal wrapper)       │  (User input)   │
└────────────────────────────────────────┘
         ↓               ↓
┌─────────────────────────────────────────┐
│            API Layer                    │
│  - Validates requests                   │
│  - Checks permissions                   │
│  - Database operations                  │
└─────────────────────────────────────────┘
```

## State Management

The CRUD system manages several pieces of state:

### Global State (Shared)
- `collections` - The actual data arrays (posts, tasks, etc.)
- `showCrud` - Is the modal open?
- `action` - What action are we doing? (create/update/delete)
- `activeCollection` - Which collection are we working with?
- `activeItem` - The item being edited
- `loading` - Loading states for different operations

### How State Flows

1. **Collections state** is the source of truth for displayed data
2. **Optimistic updates** modify this state immediately
3. **Server responses** replace optimistic items
4. **Errors** trigger rollbacks to previous state

## Error Handling

### What Happens on Error?

1. **Network Error**: 
   - Rollback optimistic update
   - Show error toast
   - Keep modal open for retry

2. **Validation Error**:
   - Show field-specific errors
   - Keep form open for correction

3. **Permission Error**:
   - Show authorization message
   - Close modal
   - Potentially redirect

### Rollback Strategies

- **Create**: Remove the optimistically added item
- **Update**: Restore original values (if cached)
- **Delete**: More complex - items need to be restored (limitation: requires refetch)

## Best Practices for Developers

### Adding a New Collection

1. Create your collection folder structure
2. Define your schema with Zod for validation
3. Create Form and List components
4. Server endpoints are auto-generated from base queries
5. Test optimistic updates work smoothly

### Customizing Behavior

- **Custom validation**: Add to your Zod schema
- **Custom UI**: Override the form component
- **Custom queries**: Extend the base query functions
- **Custom optimistic logic**: Modify in your form's send handler

### Performance Tips

1. **Use pagination** for large datasets
2. **Debounce search** inputs
3. **Memoize computed values** in lists
4. **Virtual scroll** for very long lists
5. **Lazy load** form components

## Common Patterns

### Multi-step Forms
```javascript
// Track step in form component
const step = ref(1)
// Only send on final step
if (step.value === 3) {
  send('create', collection, formData)
}
```

### Bulk Operations
```javascript
// Select multiple items
const selectedIds = ref([])
// Delete all at once
open('delete', 'posts', selectedIds.value)
```

### Real-time Updates
```javascript
// Add WebSocket listener
socket.on('post-updated', (post) => {
  // Update in collection
  const index = posts.value.findIndex(p => p.id === post.id)
  if (index !== -1) {
    posts.value[index] = post
  }
})
```

## Debugging Tips

### Check These When Things Go Wrong

1. **Component not showing?**
   - Is it registered with the right prefix?
   - Did you restart the dev server?

2. **Optimistic update not working?**
   - Check the optimisticId is being added
   - Verify the collection name matches

3. **API failing?**
   - Check network tab for actual error
   - Verify user has team access
   - Check database query logs

4. **State out of sync?**
   - Check for duplicate API calls
   - Verify optimistic replacement logic
   - Look for missing await keywords

### Useful Console Commands

```javascript
// Check current CRUD state
const { showCrud, action, activeItem } = useCrud()
console.log({ showCrud: showCrud.value, action: action.value, activeItem: activeItem.value })

// Check collection data
const { posts } = useCollections()
console.log('Posts:', posts.value)

// Force refresh
await getCollection('posts', {}, false)
```

## Summary

This CRUD system is built for speed and user experience:

1. **Instant feedback** through optimistic updates
2. **Consistent patterns** across all collections
3. **Automatic features** like auth and error handling
4. **Extensible design** for customization
5. **Type-safe** from database to UI

The flow is always:
**User Action → Optimistic Update → UI Update → API Call → Replace with Real Data**

This makes your app feel fast and responsive while maintaining data integrity!