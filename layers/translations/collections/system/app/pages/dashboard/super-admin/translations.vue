<template>
  <AppContainer title="System Translations">
    <TranslationsSystemList />
  </AppContainer>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'super-admin',
})
</script>