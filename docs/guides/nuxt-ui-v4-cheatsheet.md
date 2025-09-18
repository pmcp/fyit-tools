# Nuxt UI v4 Quick Reference Cheatsheet

## 🚨 CRITICAL: Component Name Changes (v3 → v4)

| ❌ OLD (v3) | ✅ NEW (v4) | Notes |
|-------------|-------------|-------|
| `UDropdown` | `UDropdownMenu` | Complete rename |
| `UDivider` | `USeparator` | Complete rename |
| `UToggle` | `USwitch` | Complete rename |
| `UNotification` | `UToast` | Complete rename |
| `UVerticalNavigation` | `UNavigationMenu` | Different API |
| `UCommandPalette` | `UCommandPalette` | Same name, different slots |

## 🔥 Most Common Mistakes to Avoid

### ❌ NEVER: Modal with UCard
```vue
<!-- WRONG - This is v3 pattern -->
<UModal v-model="open">
  <UCard>
    <template #header>Title</template>
    <template #footer>Buttons</template>
  </UCard>
</UModal>
```

### ✅ ALWAYS: Modal with #content slot
```vue
<!-- CORRECT - v4 pattern -->
<UModal v-model="open">
  <template #content="{ close }">
    <div class="p-6">
      <h3 class="text-lg font-semibold mb-4">Title</h3>
      <div>Content</div>
      <div class="flex justify-end gap-2 mt-6">
        <UButton @click="close">Close</UButton>
      </div>
    </div>
  </template>
</UModal>
```

## 📋 Copy-Paste Ready Templates

### Modal with Form
```vue
<UModal v-model="isOpen">
  <template #content="{ close }">
    <div class="p-6">
      <h3 class="text-lg font-semibold mb-4">Edit Item</h3>

      <UForm :state="formState" :schema="schema" @submit="onSubmit" class="space-y-4">
        <UFormField label="Name" name="name">
          <UInput v-model="formState.name" />
        </UFormField>

        <UFormField label="Description" name="description">
          <UTextarea v-model="formState.description" />
        </UFormField>

        <div class="flex justify-end gap-2 mt-6">
          <UButton color="gray" variant="ghost" @click="close">
            Cancel
          </UButton>
          <UButton type="submit" color="primary">
            Save
          </UButton>
        </div>
      </UForm>
    </div>
  </template>
</UModal>
```

### Slideover with List
```vue
<USlideover v-model="isOpen">
  <template #content="{ close }">
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">Select Items</h3>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-lucide-x"
          @click="close"
        />
      </div>

      <div class="space-y-2">
        <div v-for="item in items" :key="item.id">
          <UCheckbox v-model="selected" :value="item.id">
            {{ item.name }}
          </UCheckbox>
        </div>
      </div>
    </div>
  </template>
</USlideover>
```

### Drawer with Actions
```vue
<UDrawer v-model="isOpen" side="right">
  <template #content="{ close }">
    <div class="p-6 h-full flex flex-col">
      <h3 class="text-lg font-semibold mb-4">Settings</h3>

      <div class="flex-1 space-y-4">
        <!-- Settings content -->
      </div>

      <div class="flex gap-2 pt-4 border-t">
        <UButton color="gray" variant="ghost" @click="close" class="flex-1">
          Cancel
        </UButton>
        <UButton color="primary" @click="save" class="flex-1">
          Apply
        </UButton>
      </div>
    </div>
  </template>
</UDrawer>
```

### Dropdown Menu
```vue
<UDropdownMenu :items="menuItems">
  <UButton color="gray" variant="ghost" icon="i-lucide-more-vertical" />
</UDropdownMenu>

<script setup>
const menuItems = [
  [{
    label: 'Edit',
    icon: 'i-lucide-edit',
    onClick: () => console.log('Edit')
  }],
  [{
    label: 'Delete',
    icon: 'i-lucide-trash',
    color: 'red',
    onClick: () => console.log('Delete')
  }]
]
</script>
```

### Toast Notifications
```vue
<script setup>
const toast = useToast()

// Success toast
toast.add({
  title: 'Success',
  description: 'Operation completed successfully',
  color: 'green'
})

// Error toast
toast.add({
  title: 'Error',
  description: 'Something went wrong',
  color: 'red'
})
</script>
```

### Confirmation Modal
```vue
<UModal v-model="confirmOpen">
  <template #content="{ close }">
    <div class="p-6">
      <div class="flex items-center gap-3 mb-4">
        <UIcon name="i-lucide-alert-triangle" class="text-orange-500 w-6 h-6" />
        <h3 class="text-lg font-semibold">Confirm Action</h3>
      </div>

      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Are you sure you want to delete this item? This action cannot be undone.
      </p>

      <div class="flex justify-end gap-2">
        <UButton color="gray" variant="ghost" @click="close">
          Cancel
        </UButton>
        <UButton color="red" @click="handleDelete">
          Delete
        </UButton>
      </div>
    </div>
  </template>
</UModal>
```

## 🎨 Component Categories Reference

### Layout Components
- `UContainer` - Responsive container
- `UCard` - Card with header/footer slots (NOT in modals!)
- `USeparator` - Divider line (was UDivider)
- `UAspectRatio` - Aspect ratio wrapper

### Form Components
- `UForm` - Form wrapper with validation
- `UFormField` - Field wrapper with label/error
- `UInput` - Text input
- `UTextarea` - Multi-line text
- `USelect` - Native select
- `USelectMenu` - Advanced select with search
- `UCheckbox` - Checkbox input
- `UCheckboxGroup` - Group of checkboxes
- `URadioGroup` - Radio button group
- `USwitch` - Toggle switch (was UToggle)

### Overlay Components
- `UModal` - Modal dialog (uses #content slot)
- `USlideover` - Slide-in panel (uses #content slot)
- `UDrawer` - Drawer panel (uses #content slot)
- `UPopover` - Popover overlay
- `UTooltip` - Tooltip on hover
- `UContextMenu` - Right-click menu
- `UDropdownMenu` - Dropdown menu (was UDropdown)

### Feedback Components
- `UAlert` - Alert message
- `UToast` - Toast notification (was UNotification)
- `USkeleton` - Loading skeleton
- `UProgress` - Progress bar

### Data Components
- `UTable` - Data table
- `UPagination` - Pagination controls
- `UBadge` - Badge/tag
- `UAvatar` - User avatar
- `UAvatarGroup` - Group of avatars

## 🔍 Quick Validation Script

Add this to your package.json scripts:
```json
{
  "scripts": {
    "check:ui-patterns": "grep -r 'UModal.*UCard\\|template #header\\|template #footer\\|UDropdown[^M]\\|UDivider\\|UToggle\\|UNotification' --include='*.vue' . || echo 'No v3 patterns found ✅'"
  }
}
```

## 🎯 Key Rules to Remember

1. **Modals/Slideovers/Drawers**: Always use `template #content="{ close }"`
2. **No UCard inside overlays**: UCard is for page content, not modals
3. **Component renames**: Always use the v4 names
4. **Toast not Notification**: Use `useToast()` composable
5. **DropdownMenu not Dropdown**: Complete API change
6. **Switch not Toggle**: Different component name
7. **Separator not Divider**: Different component name

## 🚀 Migration Checklist

When updating components:
- [ ] Replace all `UDropdown` with `UDropdownMenu`
- [ ] Replace all `UDivider` with `USeparator`
- [ ] Replace all `UToggle` with `USwitch`
- [ ] Replace all `UNotification` with `UToast`
- [ ] Remove `UCard` from inside `UModal`
- [ ] Update modal slots from `#header/#footer` to `#content`
- [ ] Add `{ close }` prop to overlay content slots
- [ ] Update dropdown menu item structures