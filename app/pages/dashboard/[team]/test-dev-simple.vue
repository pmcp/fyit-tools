<template>
  <div class="container mx-auto p-6 space-y-8">
    <h1 class="text-2xl font-bold mb-6">Simple Translation Dev Mode Test</h1>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Instructions</h2>
      </template>
      <ol class="list-decimal list-inside space-y-2">
        <li>Click the "Dev Edit" button in the bottom right corner to enable dev mode</li>
        <li>When enabled, translatable text will have colored dashed outlines</li>
        <li>Blue outline = system translation</li>
        <li>Green outline = team override</li>
        <li>Red pulsing outline = missing translation</li>
      </ol>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Simple Examples with v-t directive</h2>
      </template>
      <div class="space-y-4">
        <div>
          <strong>Common Actions:</strong>
          <div class="flex gap-4 mt-2">
            <span>{{ t('common.save') }}</span>
            <span>{{ t('common.cancel') }}</span>
            <span>{{ t('common.delete') }}</span>
            <span>{{ t('common.edit') }}</span>
          </div>
        </div>

        <div>
          <strong>Navigation (may be missing):</strong>
          <div class="flex gap-4 mt-2">
            <span>{{ t('nav.home') }}</span>
            <span>{{ t('nav.dashboard') }}</span>
            <span>{{ t('nav.settings') }}</span>
            <span>{{ t('nav.profile') }}</span>
          </div>
        </div>

        <div>
          <strong>Definitely Missing Translations (should appear red):</strong>
          <div class="flex gap-4 mt-2">
            <span>{{ t('missing.key.one') }}</span>
            <span>{{ t('missing.key.two') }}</span>
            <span>{{ t('missing.key.three') }}</span>
          </div>
        </div>

        <div>
          <strong>Messages:</strong>
          <div class="space-y-2 mt-2">
            <p>{{ t('messages.welcome', { params: { name: 'User' } }) }}</p>
            <p>{{ t('messages.success') }}</p>
            <p>{{ t('messages.error') }}</p>
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
        <div>Is Dev Environment: <UBadge :color="isDev ? 'green' : 'gray'">{{ isDev ? 'YES' : 'NO' }}</UBadge></div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { t, locale, isDev, devModeEnabled } = useT()
const route = useRoute()
</script>