<template>
  <div>
    <AppSidebarContent class="mt-2">
      <AppSidebarGroup>
        <AppSidebarLink
          to="/dashboard"
          icon="i-lucide-chevron-left"
          :label="tString('navigation.dashboard')"
        />
        <AppSidebarLink
          to="/dashboard/account-settings"
          icon="i-lucide-user"
          :label="tString('navigation.account')"
        />
        <AppSidebarLink
          to="/dashboard/account-security"
          icon="i-lucide-lock"
          :label="tString('navigation.security')"
        />
      </AppSidebarGroup>
    </AppSidebarContent>
  </div>
</template>

<script lang="ts" setup>
const { tString } = useT()
</script>
