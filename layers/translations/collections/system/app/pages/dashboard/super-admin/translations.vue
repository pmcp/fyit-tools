<template>
  {{ $t('navigation.backToDashboard') }}
  <TranslationsSystemList />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'super-admin',
})
</script>
