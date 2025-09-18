<template>
  <div class="container mx-auto p-6 space-y-8">
    <h1 class="text-2xl font-bold mb-6">Automatic Missing Translation Detection Test</h1>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">How It Works</h2>
      </template>
      <ol class="list-decimal list-inside space-y-2">
        <li>This page uses regular <code>t('key')</code> calls without any manual `:class` bindings</li>
        <li>Missing translations should automatically get red pulsing outlines when dev mode is ON</li>
        <li>No manual work required - the DOM scanner detects `[key.name]` patterns automatically</li>
        <li>Toggle dev mode to see the magic happen!</li>
      </ol>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Test Translations (No Manual Classes)</h2>
      </template>
      <div class="space-y-4">
        <div>
          <strong>Existing Translations (should work normally):</strong>
          <div class="flex gap-4 mt-2">
            <span>{{ t('common.save') }}</span>
            <span>{{ t('common.cancel') }}</span>
            <span>{{ t('common.delete') }}</span>
            <span>{{ t('common.edit') }}</span>
          </div>
        </div>

        <div>
          <strong>Missing Navigation (should auto-detect red outline):</strong>
          <div class="flex gap-4 mt-2">
            <span>{{ t('auto.nav.home') }}</span>
            <span>{{ t('auto.nav.about') }}</span>
            <span>{{ t('auto.nav.contact') }}</span>
            <span>{{ t('auto.nav.help') }}</span>
          </div>
        </div>

        <div>
          <strong>Missing Messages (should auto-detect red outline):</strong>
          <div class="space-y-2 mt-2">
            <p>{{ t('auto.messages.loading') }}</p>
            <p>{{ t('auto.messages.empty') }}</p>
            <p>{{ t('auto.messages.retry') }}</p>
          </div>
        </div>

        <div>
          <strong>Complex Missing Keys (should auto-detect red outline):</strong>
          <div class="space-y-2 mt-2">
            <p>{{ t('auto.complex.deeply.nested.key') }}</p>
            <p>{{ t('auto.ui.buttons.submit-form') }}</p>
            <p>{{ t('auto.errors.validation.required') }}</p>
          </div>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Current State</h2>
      </template>
      <div class="space-y-2">
        <div>Dev Mode Enabled: <UBadge :color="devModeEnabled ? 'green' : 'gray'">{{ devModeEnabled ? 'ON' : 'OFF' }}</UBadge></div>
        <div>Current Locale: <UBadge>{{ locale }}</UBadge></div>
        <div>Current Team: <UBadge>{{ route.params.team || 'None' }}</UBadge></div>
        <div>Auto-Detection: <UBadge color="blue">Active</UBadge></div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { t, locale, isDev, devModeEnabled } = useT()
const route = useRoute()
</script>