<template>
  <div class="container mx-auto p-6 space-y-8">
    <h1 class="text-2xl font-bold mb-6">Automatic Dev Mode Test</h1>

    <!-- Dev Mode Toggle directly embedded for testing -->
    <DevModeToggle />

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Instructions</h2>
      </template>
      <p class="mb-4">This page tests automatic wrapping of ALL translations when dev mode is enabled.</p>
      <p>No manual `:class="tClass('key')"` bindings are used here - everything should work automatically!</p>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Automatic Translation Wrapping</h2>
      </template>
      <div class="space-y-4">
        <div>
          <strong>Common Actions (should be blue - system translations):</strong>
          <div class="flex gap-4 mt-2">
            <span>{{ t('common.save') }}</span>
            <span>{{ t('common.cancel') }}</span>
            <span>{{ t('common.delete') }}</span>
            <span>{{ t('common.edit') }}</span>
          </div>
        </div>

        <div>
          <strong>Navigation (should be red - missing translations):</strong>
          <div class="flex gap-4 mt-2">
            <span>{{ t('nav.home') }}</span>
            <span>{{ t('nav.dashboard') }}</span>
            <span>{{ t('nav.settings') }}</span>
            <span>{{ t('nav.profile') }}</span>
          </div>
        </div>

        <div>
          <strong>Missing Translations (should be red and pulsing):</strong>
          <div class="flex gap-4 mt-2">
            <span>{{ t('missing.auto.one') }}</span>
            <span>{{ t('missing.auto.two') }}</span>
            <span>{{ t('missing.auto.three') }}</span>
          </div>
        </div>

        <div>
          <strong>Messages:</strong>
          <div class="space-y-2 mt-2">
            <p>{{ t('messages.welcome', { params: { name: 'Auto User' } }) }}</p>
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
import DevModeToggle from '../../../../layers/translations/app/components/DevModeToggle.vue'

const { t, locale, isDev, devModeEnabled } = useT()
const route = useRoute()
</script>