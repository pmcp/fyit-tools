<template>
  <div class="space-y-2">
    <AuthSocialLoginButton
      :label="t('auth.socialLogin.google')"
      icon="i-logos-google-icon"
      provider="google"
    />
    <AuthSocialLoginButton
      :label="t('auth.socialLogin.github')"
      icon="i-mdi-github"
      provider="github"
    />
    <AuthSocialLoginButton
      :label="t('auth.socialLogin.discord')"
      icon="i-logos-discord-icon"
      provider="discord"
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useT()
</script>
