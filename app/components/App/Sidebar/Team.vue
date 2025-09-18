<template>
  <header>
    <AppTeamDropdown />
  </header>
  <AppSidebarContent class="mt-2">
    <AppSidebarGroup>
      <AppSidebarLink v-for="link in links" :key="link.to" v-bind="link" />
      <template v-if="isTeamOwner">
        <USeparator class="my-4" />
        <AppSidebarLink v-for="link in settings" :key="link.to" v-bind="link" />
      </template>
    </AppSidebarGroup>
  </AppSidebarContent>
</template>

<script lang="ts" setup>
const { tString } = useT()
import { useTeam } from '@/composables/useTeam'

const { isTeamOwner, currentTeam } = useTeam()

const links = computed(() => [
  {
    label: tString('sidebar.home'),
    icon: 'i-lucide-home',
    to: `/dashboard/${currentTeam.value.slug}`,
  },
  {
    label: tString('navigation.teamTranslations'),
    icon: 'i-lucide-languages',
    to: `/dashboard/${currentTeam.value.slug}/translations`,
  },
])

const settings = computed(() => [
  {
    label: tString('workspace.settings.title'),
    icon: 'i-lucide-settings',
    to: `/dashboard/${currentTeam.value.slug}/settings`,
  },
  {
    label: tString('workspace.settings.members'),
    icon: 'i-lucide-users',
    to: `/dashboard/${currentTeam.value.slug}/settings/members`,
  },
  {
    label: tString('workspace.settings.billing'),
    icon: 'i-lucide-credit-card',
    to: `/dashboard/${currentTeam.value.slug}/settings/billing`,
  },
])
</script>
