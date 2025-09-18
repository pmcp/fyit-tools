<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField :label="t('fields.message')" name="message">
      <UTextarea
        v-model="state.message"
        size="lg"
        variant="soft"
        class="w-full"
      />
    </UFormField>

    <UButton type="submit" size="lg" block :loading="loading" :label="t('common.submit')" />
  </UForm>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
  user: z.string(),
  message: z.string().min(1, 'Message is required'),
  meta: z.object({
    browser: z.string(),
    screenResolution: z.string(),
    language: z.string(),
    platform: z.string(),
    colorScheme: z.string(),
    timezone: z.string(),
    url: z.string(),
  }),
})

const { user } = useUserSession()
const { t } = useT()
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  user: user.value?.id,
  message: '',
  meta: {
    browser: navigator.userAgent,
    screenResolution: `${window.innerWidth}x${window.innerHeight}`,
    language: navigator.language,

    platform: navigator.platform,
    colorScheme: useColorMode().preference,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    url: `${window.location.origin}${window.location.pathname}`,
  },
})
const emit = defineEmits<(e: 'close') => void>()
const loading = ref(false)
const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log(event.data)
  loading.value = true
  try {
    await $fetch('/api/super-admin/feedback', {
      method: 'POST',
      body: event.data,
    })
    toast.add({
      title: t('messages.feedbackSubmitted'),
      description: t('messages.feedbackSubmittedDesc'),
      color: 'success',
    })
    emit('close')
  } catch (error) {
    console.error(error)
    toast.add({
      title: t('messages.error'),
      description: t('messages.somethingWentWrong'),
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>
