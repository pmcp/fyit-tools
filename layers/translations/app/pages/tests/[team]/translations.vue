<template>
  <div class="container mx-auto p-6 space-y-8">
    <h1 class="text-2xl font-bold mb-6">Phase 1: Missing-Only Translation Dev Mode</h1>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Instructions</h2>
      </template>
      <ol class="list-decimal list-inside space-y-2">
        <li>Click the language icon button in the bottom right corner to enable dev mode</li>
        <li>When enabled, missing translations will be highlighted with red dashed outlines</li>
        <li>Click on a missing translation to add a value for it</li>
      </ol>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Test Translations</h2>
      </template>
      <div class="space-y-4">
        <div>
          <strong>Should work (existing translations):</strong>
          <div class="flex gap-4 mt-2">
            <span>{{ t('common.save') }}</span>
            <span>{{ t('common.cancel') }}</span>
            <span>{{ t('common.delete') }}</span>
          </div>
        </div>

        <div>
          <strong>Should show as [key] (missing translations):</strong>
          <div class="flex gap-4 mt-2 flex-wrap">
            <span>{{ t('test.missing.one') }}</span>
            <span>{{ t('test.missing.two') }}</span>
            <span>{{ t('test.missing.three') }}</span>
            <span>{{ t('definitely.not.exists') }}</span>
            <span>{{ t('another.missing.key') }}</span>
          </div>
        </div>

        <div>
          <strong>With parameters (testing interpolation):</strong>
          <div class="space-y-2 mt-2">
            <p>{{ t('test.welcome', { params: { name: 'User' } }) }}</p>
            <p>{{ t('test.count', { params: { count: 5 } }) }}</p>
          </div>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Dev Mode Status</h2>
      </template>
      <div class="space-y-2">
        <div>Dev Mode Enabled:
          <UBadge :color="devModeEnabled ? 'success' : 'neutral'">
            {{ devModeEnabled ? 'ON' : 'OFF' }}
          </UBadge>
        </div>
        <div>Current Locale: <UBadge>{{ locale }}</UBadge></div>
        <div>Environment:
          <UBadge :color="isDev ? 'success' : 'neutral'">
            {{ isDev ? 'Development' : 'Production' }}
          </UBadge>
        </div>
      </div>
    </UCard>

    <!-- Include DevModeToggle component -->
    <DevModeToggle />
  </div>
</template>

<script setup lang="ts">
const { t, locale, isDev, devModeEnabled } = useT()
</script>