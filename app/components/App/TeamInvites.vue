<template>
  <div>
    <!-- Pending Invitations Table -->
    <p class="text-sm font-semibold">{{ t('team.invites.pendingInvitations') }}</p>
    <div
      class="mt-2 overflow-x-auto rounded-lg border border-neutral-200 dark:divide-white/10 dark:border-white/10"
    >
      <table
        v-if="pendingInvites.length"
        class="min-w-full divide-y divide-neutral-200 dark:divide-white/10"
      >
        <thead>
          <tr class="text-sm">
            <th
              v-for="column in pendingColumns"
              :key="column"
              class="px-4 py-3 text-left text-sm font-semibold"
            >
              {{ column }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-200 dark:divide-white/10">
          <tr
            v-for="invite in pendingInvites"
            :key="invite.id"
            class="text-sm [&>td]:whitespace-nowrap"
          >
            <td class="px-4 py-3">{{ invite.email }}</td>
            <td class="px-4 py-3">
              <UBadge
                color="neutral"
                size="sm"
                variant="subtle"
                class="uppercase"
              >
                {{ invite.role }}
              </UBadge>
            </td>
            <td class="px-4 py-3">
              <UBadge
                color="warning"
                size="sm"
                variant="subtle"
                class="uppercase"
              >
                {{ invite.status }}
              </UBadge>
            </td>
            <td class="px-4 py-3">
              {{ invite.expiresAt ? useDateFormat(invite.expiresAt, 'MMM D, YYYY').value : '-' }}
            </td>
            <td class="px-4 py-3">
              {{ invite.createdAt ? useDateFormat(invite.createdAt, 'MMM D, YYYY').value : '-' }}
            </td>
            <td class="px-4 py-3">
              <UDropdownMenu
                :items="getRowItems(invite)"
                :content="{
                  align: 'end',
                  side: 'bottom',
                }"
              >
                <UButton
                  icon="i-lucide-ellipsis"
                  variant="ghost"
                  color="neutral"
                />
              </UDropdownMenu>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="flex h-32 flex-col items-center justify-center gap-3">
        <UIcon name="i-lucide-inbox" class="size-8" />
        <p class="text-sm text-neutral-500">{{ t('team.invites.noPendingInvitations') }}</p>
      </div>
    </div>

    <!-- Accepted Invitations Table -->
    <p v-if="acceptedInvites.length" class="mt-8 text-sm font-semibold">{{ t('team.invites.acceptedInvitations') }}</p>
    <div
      v-if="acceptedInvites.length"
      class="mt-2 overflow-x-auto rounded-lg border border-neutral-200 dark:divide-white/10 dark:border-white/10"
    >
      <table
        class="min-w-full divide-y divide-neutral-200 dark:divide-white/10"
      >
        <thead>
          <tr class="text-sm">
            <th
              v-for="column in acceptedColumns"
              :key="column"
              class="px-4 py-3 text-left text-sm font-semibold"
            >
              {{ column }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-200 dark:divide-white/10">
          <tr
            v-for="invite in acceptedInvites"
            :key="invite.id"
            class="text-sm [&>td]:whitespace-nowrap"
          >
            <td class="px-4 py-3">{{ invite.email }}</td>
            <td class="px-4 py-3">
              <UBadge
                color="neutral"
                size="sm"
                variant="subtle"
                class="uppercase"
              >
                {{ invite.role }}
              </UBadge>
            </td>
            <td class="px-4 py-3">
              {{ invite.acceptedAt ? useDateFormat(invite.acceptedAt, 'MMM D, YYYY').value : '-' }}
            </td>
            <td class="px-4 py-3">
              {{ invite.acceptedByEmail || '-' }}
            </td>
            <td class="px-4 py-3">
              {{ invite.createdAt ? useDateFormat(invite.createdAt, 'MMM D, YYYY').value : '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useDateFormat } from '@vueuse/core'
import type { TeamInvite } from '@@/types/database'
import type { DropdownMenuItem } from '@nuxt/ui'
import type { FetchError } from 'ofetch'

type TeamInviteAccepted = TeamInvite & { acceptedByEmail?: string }

const { currentTeam, cancelInvite, resendInvite } = useTeam()
const toast = useToast()
const { t } = useT()

const { data: teamInvites, refresh: fetchTeamInvites } = await useFetch<TeamInviteAccepted[]>(`/api/teams/${currentTeam.value.id}/invites`, {
  key: 'team-invites',
})

// Split invites into pending and accepted
const pendingInvites = computed(() =>
  teamInvites.value?.filter((invite) => invite.status !== 'accepted') || [],
)

const acceptedInvites = computed(() =>
  teamInvites.value?.filter((invite) => invite.status === 'accepted') || [],
)

const pendingColumns = [t('table.email'), t('table.role'), t('table.status'), t('table.expiresAt'), t('table.createdAt'), '']
const acceptedColumns = [t('table.email'), t('table.role'), t('table.acceptedAt'), t('table.acceptedBy'), t('table.createdAt')]

const getRowItems = (invite: TeamInviteAccepted): DropdownMenuItem[] => {
  return [
    {
      label: t('team.invites.copyEmail'),
      onSelect: () => {
        void navigator.clipboard.writeText(invite.email).then(() => {
          toast.add({
            title: t('team.invites.emailCopied'),
            color: 'success',
          })
        })
      },
    },
    {
      label: t('team.invites.resendInvite'),
      onSelect: () => {
        void resendInvite(invite.id)
          .then(() => {
            toast.add({
              title: t('team.invites.inviteResentSuccessfully'),
              color: 'success',
            })
          })
          .catch((error) => {
            toast.add({
              title: t('team.invites.failedToResendInvite'),
              description: (error as FetchError).statusMessage,
              color: 'error',
            })
          })
      },
    },
    { type: 'separator' },
    {
      label: t('team.invites.cancelInvite'),
      color: 'error' as const,
      onSelect: () => {
        void cancelInvite(invite.id)
          .then(() => {
            toast.add({
              title: t('team.invites.inviteCancelledSuccessfully'),
              color: 'success',
            })
            return fetchTeamInvites()
          })
          .catch((error) => {
            toast.add({
              title: t('team.invites.failedToCancelInvite'),
              description: (error as FetchError).statusMessage,
              color: 'error',
            })
          })
      },
    },
  ]
}
</script>
