<template>
  <div>
    <header class="px-2">
      <p class="font-bold">Super Admin</p>
    </header>
    <AppSidebarContent class="mt-2">
      <AppSidebarGroup>
        <AppSidebarLink v-for="link in links" :key="link.to" v-bind="link" />
      </AppSidebarGroup>
    </AppSidebarContent>
  </div>
</template>

<script lang="ts" setup>
const { tString } = useT()

const links = computed(() => [
  {
    label: tString('navigation.backToDashboard'),
    icon: 'i-lucide-chevron-left',
    to: '/dashboard',
  },
  {
    label: tString('navigation.users'),
    icon: 'i-lucide-users',
    to: '/dashboard/super-admin',
  },
  {
    label: tString('navigation.teams'),
    icon: 'i-lucide-users',
    to: '/dashboard/super-admin/teams',
  },
  {
    label: tString('navigation.translations'),
    icon: 'i-lucide-globe',
    to: '/dashboard/super-admin/translations',
  },
  {
    label: tString('navigation.stripePlans'),
    icon: 'i-lucide-credit-card',
    to: '/dashboard/super-admin/stripe-plans',
  },
  {
    label: tString('navigation.feedbackSubmissions'),
    icon: 'i-lucide-message-circle',
    to: '/dashboard/super-admin/feedback-submissions',
  },
  {
    label: tString('navigation.newsletterSubscribers'),
    icon: 'i-lucide-mail',
    to: '/dashboard/super-admin/newsletter-subscribers',
  },
])
</script>
