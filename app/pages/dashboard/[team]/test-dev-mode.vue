<template>
  <div class="container mx-auto p-6 space-y-8">
    <h1 class="text-2xl font-bold mb-6">Translation Dev Mode Test</h1>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Instructions</h2>
      </template>
      <ol class="list-decimal list-inside space-y-2">
        <li>Click the "Dev Edit" button in the bottom right corner to enable dev mode</li>
        <li>When enabled, translatable text will have colored dashed outlines</li>
        <li>Click on any outlined text to edit it inline</li>
        <li>Press Enter to save or Esc to cancel</li>
      </ol>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Translation Examples</h2>
      </template>
      <div class="space-y-4">
        <!-- These will be wrapped with DevTranslationWrapper when dev mode is on -->
        <div>
          <strong>Common Actions:</strong>
          <div class="flex gap-4 mt-2">
            <TranslationsDevTranslationWrapper
              v-if="isDev && devModeEnabled"
              :translation-key="'common.save'"
              :current-value="t('common.save')"
              :mode="'team'"
            >
              {{ t('common.save') }}
            </TranslationsDevTranslationWrapper>
            <span v-else>{{ t('common.save') }}</span>

            <TranslationsDevTranslationWrapper
              v-if="isDev && devModeEnabled"
              :translation-key="'common.cancel'"
              :current-value="t('common.cancel')"
              :mode="'team'"
            >
              {{ t('common.cancel') }}
            </TranslationsDevTranslationWrapper>
            <span v-else>{{ t('common.cancel') }}</span>

            <TranslationsDevTranslationWrapper
              v-if="isDev && devModeEnabled"
              :translation-key="'common.delete'"
              :current-value="t('common.delete')"
              :mode="'team'"
            >
              {{ t('common.delete') }}
            </TranslationsDevTranslationWrapper>
            <span v-else>{{ t('common.delete') }}</span>

            <TranslationsDevTranslationWrapper
              v-if="isDev && devModeEnabled"
              :translation-key="'common.edit'"
              :current-value="t('common.edit')"
              :mode="'team'"
            >
              {{ t('common.edit') }}
            </TranslationsDevTranslationWrapper>
            <span v-else>{{ t('common.edit') }}</span>
          </div>
        </div>

        <div>
          <strong>Navigation:</strong>
          <div class="flex gap-4 mt-2">
            <TranslationsDevTranslationWrapper
              v-if="isDev && devModeEnabled"
              :translation-key="'nav.home'"
              :current-value="t('nav.home')"
              :is-missing="!hasTranslation('nav.home')"
              :mode="'team'"
            >
              {{ t('nav.home') }}
            </TranslationsDevTranslationWrapper>
            <span v-else>{{ t('nav.home') }}</span>

            <TranslationsDevTranslationWrapper
              v-if="isDev && devModeEnabled"
              :translation-key="'nav.dashboard'"
              :current-value="t('nav.dashboard')"
              :is-missing="!hasTranslation('nav.dashboard')"
              :mode="'team'"
            >
              {{ t('nav.dashboard') }}
            </TranslationsDevTranslationWrapper>
            <span v-else>{{ t('nav.dashboard') }}</span>

            <TranslationsDevTranslationWrapper
              v-if="isDev && devModeEnabled"
              :translation-key="'nav.settings'"
              :current-value="t('nav.settings')"
              :is-missing="!hasTranslation('nav.settings')"
              :mode="'team'"
            >
              {{ t('nav.settings') }}
            </TranslationsDevTranslationWrapper>
            <span v-else>{{ t('nav.settings') }}</span>

            <TranslationsDevTranslationWrapper
              v-if="isDev && devModeEnabled"
              :translation-key="'nav.profile'"
              :current-value="t('nav.profile')"
              :is-missing="!hasTranslation('nav.profile')"
              :mode="'team'"
            >
              {{ t('nav.profile') }}
            </TranslationsDevTranslationWrapper>
            <span v-else>{{ t('nav.profile') }}</span>
          </div>
        </div>

        <div>
          <strong>Missing Translations (should appear red):</strong>
          <div class="flex gap-4 mt-2">
            <TranslationsDevTranslationWrapper
              v-if="isDev && devModeEnabled"
              :translation-key="'missing.key.one'"
              :current-value="t('missing.key.one')"
              :is-missing="true"
              :mode="'team'"
            >
              {{ t('missing.key.one') }}
            </TranslationsDevTranslationWrapper>
            <span v-else>{{ t('missing.key.one') }}</span>

            <TranslationsDevTranslationWrapper
              v-if="isDev && devModeEnabled"
              :translation-key="'missing.key.two'"
              :current-value="t('missing.key.two')"
              :is-missing="true"
              :mode="'team'"
            >
              {{ t('missing.key.two') }}
            </TranslationsDevTranslationWrapper>
            <span v-else>{{ t('missing.key.two') }}</span>
          </div>
        </div>

        <div>
          <strong>Messages:</strong>
          <div class="space-y-2 mt-2">
            <p>
              <TranslationsDevTranslationWrapper
                v-if="isDev && devModeEnabled"
                :translation-key="'messages.welcome'"
                :current-value="t('messages.welcome', { params: { name: 'User' } })"
                :is-missing="!hasTranslation('messages.welcome')"
                :mode="'team'"
              >
                {{ t('messages.welcome', { params: { name: 'User' } }) }}
              </TranslationsDevTranslationWrapper>
              <span v-else>{{ t('messages.welcome', { params: { name: 'User' } }) }}</span>
            </p>
            <p>
              <TranslationsDevTranslationWrapper
                v-if="isDev && devModeEnabled"
                :translation-key="'messages.success'"
                :current-value="t('messages.success')"
                :is-missing="!hasTranslation('messages.success')"
                :mode="'team'"
              >
                {{ t('messages.success') }}
              </TranslationsDevTranslationWrapper>
              <span v-else>{{ t('messages.success') }}</span>
            </p>
            <p>
              <TranslationsDevTranslationWrapper
                v-if="isDev && devModeEnabled"
                :translation-key="'messages.error'"
                :current-value="t('messages.error')"
                :is-missing="!hasTranslation('messages.error')"
                :mode="'team'"
              >
                {{ t('messages.error') }}
              </TranslationsDevTranslationWrapper>
              <span v-else>{{ t('messages.error') }}</span>
            </p>
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
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { t, locale, isDev, devModeEnabled, hasTranslation } = useT()
const route = useRoute()
</script>