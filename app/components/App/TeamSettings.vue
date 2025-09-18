<template>
  <UCard>
    <template #header>
      <h3 class="text-sm font-medium">{{ t('team.generalSettings') }}</h3>
    </template>

    <UForm
      :schema="teamSchema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit as any"
    >
      <UFormField
        :label="`${t('team.teamLogo')} (${t('team.teamLogoHelp')})`"
        name="logo"
      >
        <AppAvatarUploader
          v-model="state.logo"
          @file-selected="handleFileSelected"
        />
      </UFormField>

      <UFormField required :label="t('team.teamName')" name="name">
        <UInput v-model="state.name" class="w-full" />
      </UFormField>

      <UFormField :label="t('team.teamUrl')" :help="`${host}/dashboard/${state.slug}`">
        <UInput v-model="state.slug" variant="subtle" class="w-full" disabled />
      </UFormField>

      <UFormField :label="t('team.teamId')">
        <UInput
          :value="currentTeam?.id || ''"
          variant="subtle"
          class="w-full"
          disabled
        />
      </UFormField>

      <UButton
        type="submit"
        color="neutral"
        :loading="loading"
        :disabled="loading"
      >
        {{ t('common.saveChanges') }}
      </UButton>
    </UForm>
  </UCard>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'

const toast = useToast()
const { teamSchema, updateTeam, currentTeam, loading } = useTeam()
const selectedFile = ref<File | null>(null)
const { t } = useT()

const state = reactive({
  name: currentTeam.value.name || '',
  slug: currentTeam.value.slug || '',
  logo: currentTeam.value.logo || '',
})

const handleFileSelected = (file: File | null) => {
  selectedFile.value = file
  if (!file) {
    state.logo = ''
  }
}

const uploadLogo = async () => {
  try {
    if (!selectedFile.value) return ''
    const formData = new FormData()
    formData.append('image', selectedFile.value)
    const filePath = await $fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    })
    return `/images/${filePath}`
  } catch {
    throw new Error('Failed to upload logo')
  }
}

const onSubmit = async (event: FormSubmitEvent<any>) => {
  if (!currentTeam.value.id) return

  try {
    let filePath = ''

    if (selectedFile.value) {
      filePath = await uploadLogo()
    } else if (state.logo) {
      filePath = state.logo
    } else {
      filePath = `https://api.dicebear.com/9.x/glass/svg?seed=${event.data.name}`
    }

    const teamData = {
      ...event.data,
      logo: filePath,
    }

    await updateTeam(currentTeam.value.id, teamData)
  } catch (error) {
    toast.add({
      title: t('team.failedToUpdateTeam'),
      description: (error as any).statusMessage,
      color: 'error',
    })
  }
}

const host = useRuntimeConfig().public.host
</script>
