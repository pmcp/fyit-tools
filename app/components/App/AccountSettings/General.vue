<template>
  <UCard>
    <template #header>
      <h3 class="font-medium">{{ tString('accountSettings.general.personalInformation') }}</h3>
      <p class="mt-1 text-sm text-neutral-500">
        {{ tString('accountSettings.general.privacyNotice') }}
      </p>
    </template>
    <UForm
      :schema="schema"
      :state="state"
      class="max-w-md space-y-4"
      @submit="onSubmit as any"
    >
      <UFormField :label="t('accountSettings.general.avatar')" name="avatar">
        <AppAvatarUploader
          v-model="state.avatarUrl"
          @file-selected="handleFileSelected"
        />
      </UFormField>
      <UFormField :label="t('accountSettings.general.name')" name="name">
        <UInput
          v-model="state.name"
          :placeholder="t('accountSettings.general.name')"
          class="w-full"
          size="lg"
        />
      </UFormField>
      <UFormField :label="t('accountSettings.general.email')">
        <UInput
          :value="user?.email"
          :placeholder="t('accountSettings.general.email')"
          class="w-full"
          disabled
          variant="subtle"
          size="lg"
        />
      </UFormField>
      <UFormField :label="t('accountSettings.general.accountId')">
        <UInput
          :value="user?.id"
          :placeholder="t('accountSettings.general.accountId')"
          class="w-full"
          disabled
          variant="subtle"
          size="lg"
        />
      </UFormField>
      <UButton
        color="neutral"
        :loading="loading"
        :disabled="loading"
        type="submit"
        :label="tString('common.save')"
      />
    </UForm>
  </UCard>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '#ui/types'

const { t, tString } = useT()

const { user, fetch: refreshSession } = useUserSession()
const selectedFile = ref<File | null>(null)
const { updateUser, loading, schema } = useUserAccount()

const uploadAvatar = async () => {
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
    throw new Error('Failed to upload avatar')
  }
}

const handleFileSelected = (file: File | null) => {
  selectedFile.value = file
  if (!file) {
    state.avatarUrl = ''
  }
}

const state = reactive({
  name: user.value?.name || '',
  avatarUrl: user.value?.avatarUrl || '',
})

const onSubmit = async (event: FormSubmitEvent<any>) => {
  try {
    let filePath = ''

    if (selectedFile.value) {
      filePath = await uploadAvatar()
    } else if (state.avatarUrl) {
      filePath = state.avatarUrl
    } else {
      filePath = `https://api.dicebear.com/9.x/glass/svg?seed=${event.data.name}`
    }

    const userData = {
      ...event.data,
      avatarUrl: filePath,
    }

    await updateUser(userData)
    await refreshSession()
  } catch (error) {
    console.error(error)
  }
}
</script>
