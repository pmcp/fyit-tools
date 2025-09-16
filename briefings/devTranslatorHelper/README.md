# In-Place Translation Editing System

This folder contains all the files needed to implement an in-place translation editing system for your Nuxt app with dev mode support.

## Features

- **Click-to-Edit**: Click any translatable text in dev mode to edit it inline
- **Visual Indicators**: 
  - Blue outline for system translations
  - Green outline for team overrides
  - Red pulsing outline for missing translations
- **Auto-Creation**: Automatically creates new translations when editing missing keys
- **Nuxt UI 4 Integration**: Uses proper Nuxt UI components throughout
- **Keyboard Shortcuts**: Enter to save, Escape to cancel
- **Real-time Feedback**: Toast notifications and visual feedback

## Files Included

### Components
- **DevTranslationWrapper.vue** - Wraps translatable text with editing functionality
- **DevModeToggle.vue** - Floating toggle button with info panel

### Composables
- **useT.ts** - Enhanced translation composable with dev mode support

### API Endpoints
- **api-endpoints.ts** - Server-side handlers for saving translations

### Examples
- **usage-examples.vue** - Various usage patterns and examples

## Installation

1. **Copy components** to your `components/` directory
2. **Copy useT.ts** to your `composables/` directory
3. **Add API endpoints** to your server API routes
4. **Add DevModeToggle** to your main layout (app.vue)

## Usage

### Basic Usage
```vue
<template>
  <UButton>{{ t('common.save') }}</UButton>
</template>

<script setup>
const { t } = useT()
</script>
```

### In Your Layout
```vue
<!-- app.vue -->
<template>
  <div>
    <NuxtPage />
    <DevModeToggle />
  </div>
</template>
```

## How It Works

### Development Mode
- Toggle dev mode with the floating button
- Click any blue/green/red outlined text to edit
- Changes are saved to database and synced to locale files
- Page refreshes to show changes immediately

### Production Mode
- All dev mode functionality is disabled
- Clean text rendering without any overlays
- No performance impact

## API Integration

The system requires these API endpoints:
- `PATCH /api/teams/[teamSlug]/translations` - Save team overrides
- `PUT /api/super-admin/translations-system` - Save system translations

Both endpoints support `createIfNotExists: true` to auto-create missing translations.

## Database Schema

Make sure your translation tables support:
- `teamId` (nullable for system translations)
- `keyPath` (translation key)
- `values` (JSON object with locale values)
- `category` (ui, marketing, email, etc.)
- `createIfNotExists` flag handling

## Visual Indicators

- **Blue dashed outline**: System translations
- **Green dashed outline**: Team overrides (with pulse animation)
- **Red pulsing outline**: Missing translations
- **Tooltips**: Show translation keys and editing hints

This system provides a seamless developer experience while maintaining clean separation between development and production environments.
