# Expandable Slideover Implementation Guide

## Overview

The expandable slideover feature allows users to toggle between a sidebar view and fullscreen view with a single click. This is particularly useful for:

- Complex forms that need more space
- Data tables with many columns
- Detailed editing tasks
- Mobile responsive designs

## Implementation Options

### 1. Enhanced CRUD Container (Already Implemented)

The CRUD system's `Container.vue` component now includes built-in expand functionality:

```vue
<!-- Located at: layers/crud/app/components/Container.vue -->
<!-- Features: -->
- Automatic expand button in header
- Smooth transitions between states
- Support for nested slideovers
- State tracking per slideover instance
```

Each slideover in the CRUD system now has:
- **Maximize icon** (⛶) - Expands to fullscreen
- **Minimize icon** (⛶) - Collapses back to sidebar
- Proper z-index management for nested slideovers

### 2. Reusable Component: CrudExpandableSlideover

The `CrudExpandableSlideover` component is available in the CRUD layer for expandable slideover needs:

```vue
<template>
  <CrudExpandableSlideover
    v-model:open="isOpen"
    v-model:expanded="isExpanded"
    title="My Slideover"
    icon="i-heroicons-document"
    badge="New"
    :max-width="'2xl'"
  >
    <!-- Main content -->
    <div>Your content here</div>

    <!-- Optional: Custom actions in header -->
    <template #actions>
      <UButton icon="i-heroicons-cog" size="sm" variant="ghost" />
    </template>

    <!-- Optional: Footer content -->
    <template #footer>
      <div>Footer content</div>
    </template>
  </CrudExpandableSlideover>
</template>

<script setup lang="ts">
const isOpen = ref(false)
const isExpanded = ref(false)
</script>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | v-model for open state |
| `expanded` | `boolean` | `false` | v-model for expanded state |
| `title` | `string` | Required | Slideover title |
| `icon` | `string` | - | Optional header icon |
| `badge` | `string` | - | Optional badge text |
| `badgeColor` | `string` | `'primary'` | Badge color |
| `loading` | `boolean` | `false` | Show loading state |
| `error` | `object` | - | Error state with title, description, and retry |
| `dismissible` | `boolean` | `true` | Can be closed by clicking outside |
| `maxWidth` | `string` | `'xl'` | Max width in expanded mode |

### 3. Composable: useExpandableSlideover

The composable is part of the CRUD layer and can be used for custom implementations:

```vue
<template>
  <USlideover
    v-model:open="slideover.isOpen.value"
    :side="slideover.side.value"
    :ui="slideover.slideoverUi.value"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <h2>{{ title }}</h2>
        <div class="flex gap-1">
          <UButton
            :icon="slideover.expandIcon.value"
            @click="slideover.toggleExpand"
          />
          <UButton
            icon="i-heroicons-x-mark"
            @click="slideover.close"
          />
        </div>
      </div>
    </template>

    <template #body>
      <div :class="slideover.isExpanded.value ? 'p-6' : 'p-4'">
        <!-- Your content -->
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
const slideover = useExpandableSlideover({
  maxWidth: '2xl',
  defaultExpanded: false
})

// Methods available:
// slideover.open(expanded?: boolean)
// slideover.close()
// slideover.toggleExpand()
// slideover.expand()
// slideover.collapse()
</script>
```

## UI Behavior

### Sidebar Mode (Default)
- Opens from the right side
- Takes up partial screen width
- Main content remains visible
- Configurable max width

### Fullscreen Mode (Expanded)
- Covers entire viewport
- Overlay behind content
- Better for complex content
- Centered content with max-width

### Transitions
- Smooth width animation
- Always slides from right
- No jarring position changes
- Natural expand/collapse feel
- Z-index management for stacking

## Best Practices

1. **Use Cases**
   - Complex forms: Expand for more fields
   - Data tables: Expand for better visibility
   - Document editing: Expand for focus mode
   - Mobile: Start expanded on small screens

2. **Performance**
   - Lazy load heavy content
   - Use skeletons for loading states
   - Consider virtual scrolling for long lists

3. **Accessibility**
   - Maintain keyboard navigation
   - Proper ARIA labels
   - Focus management
   - Clear visual indicators

4. **Responsive Design**
   ```vue
   // Auto-expand on mobile
   const isMobile = useMediaQuery('(max-width: 640px)')

   watchEffect(() => {
     if (isMobile.value && slideover.isOpen.value) {
       slideover.expand()
     }
   })
   ```

## Examples

### Form Example
```vue
<CrudExpandableSlideover
  v-model:open="formOpen"
  title="Edit User"
  icon="i-heroicons-user"
>
  <UForm :state="formState" @submit="onSubmit">
    <!-- Form fields -->
  </UForm>
</CrudExpandableSlideover>
```

### Table Example
```vue
<CrudExpandableSlideover
  v-model:open="tableOpen"
  title="User Management"
  badge="100 users"
  :max-width="'4xl'"
>
  <UTable
    :columns="columns"
    :rows="users"
  />
</CrudExpandableSlideover>
```

### CRUD Integration
The CRUD system automatically supports expansion:

```typescript
// In your CRUD collection
const { open } = useCrud()

// Opens with expand capability built-in
open({
  collection: 'users',
  action: 'update',
  containerType: 'slideover', // Has expand button
  activeItem: user
})
```

## Migration from Standard Slideover

To add expand functionality to existing slideovers:

1. **Replace USlideover with ExpandableSlideover**
2. **Add expanded v-model if needed**
3. **Or use the composable for more control**

Before:
```vue
<USlideover v-model:open="isOpen">
  <!-- content -->
</USlideover>
```

After:
```vue
<CrudExpandableSlideover v-model:open="isOpen" title="My Content">
  <!-- content -->
</CrudExpandableSlideover>
```

## Location

The expandable slideover functionality is located in the CRUD layer:
- Component: `layers/crud/app/components/ExpandableSlideover.vue`
- Composable: `layers/crud/app/composables/useExpandableSlideover.ts`
- Container: `layers/crud/app/components/Container.vue` (built-in support)

## Technical Details

The implementation uses:
- Nuxt UI 4's USlideover component
- Always `side="right"` (no prop changes)
- Dynamic `ui` prop to override content width classes
- Overrides `content` class from `max-w-md` to `max-w-none` when expanded
- Smooth CSS transitions between width states
- VueUse composables for responsive behavior
- TypeScript for type safety

### How It Works

Instead of changing the `side` prop (which causes jarring transitions), the implementation:

1. **Keeps `side="right"`** - Always slides in from the right
2. **Modifies UI classes** - Changes the `content` slot classes:
   - Normal: `'right-0 inset-y-0 w-full max-w-xl'` (or configured width)
   - Expanded: `'right-0 inset-y-0 w-full max-w-none'` (full width)
3. **Smooth transitions** - Width changes animate smoothly
4. **Better UX** - No position changes, just width expansion