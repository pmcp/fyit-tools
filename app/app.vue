<template>
  <NuxtRouteAnnouncer />
  <NuxtLoadingIndicator color="#000000" />
  <UApp :toaster="{ position: 'bottom-right' }">
    <NuxtPage />
  </UApp>

  <!--  TODO: ONLY WHEN ADMIN OR HIGHER? -->
  <CrudContainer />
  
  <TranslationsLanguageSwitcherIsland />

</template>

<script lang="ts" setup>
useSeoMeta({
  title: 'Supersaas',
  description: 'The fullstack Nuxt 3 SaaS starter kit',
})
</script>
