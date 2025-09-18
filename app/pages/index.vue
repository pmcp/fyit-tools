<!-- Everything in a single page on purpose. So you can just delete it if you don't need it. -->
<template>
  <main class="px-4">
    <header>
      <WebsiteSection class="flex w-full items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2">
          <img src="/logo.png" alt="logo" class="h-6 w-auto md:h-7">
          <p class="font-bold">Supersaas V3</p>
        </NuxtLink>
        <div class="hidden flex-1 items-center justify-center gap-3 md:flex">
          <UButton :label="tString('buttons.features')" color="neutral" variant="ghost" />
          <UButton :label="tString('buttons.pricing')" color="neutral" variant="ghost" />
          <UButton :label="tString('buttons.blog')" color="neutral" variant="ghost" />
          <UButton :label="tString('buttons.docs')" color="neutral" variant="ghost" />
        </div>
        <div class="flex items-center gap-3">
          <AuthState v-slot="{ loggedIn: isAuthLoggedIn }">
            <UButton
              v-if="isAuthLoggedIn"
              color="neutral"
              variant="soft"
              :label="tString('buttons.goToApp')"
              to="/dashboard"
            />
            <UFieldGroup v-else>
              <UButton
                color="neutral"
                variant="soft"
                to="/auth/login"
                :label="tString('auth.login')"
              />
              <UDropdownMenu
                :items="authOptions"
                :content="{
                  align: 'end',
                  side: 'bottom',
                  sideOffset: 8,
                }"
                :ui="{
                  content: 'w-full',
                  itemLeadingIcon: 'size-4',
                }"
              >
                <UButton
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-chevron-down"
                  class="border-l border-neutral-200/50 dark:border-white/10"
                />
              </UDropdownMenu>
            </UFieldGroup>
          </AuthState>
          <ThemeToggle />
        </div>
      </WebsiteSection>
    </header>

    <WebsiteSection>

    </WebsiteSection>

  </main>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { loggedIn } = useUserSession()
const { tString } = useT()

const authOptions = computed(() => [
  {
    label: tString('auth.login') + ' (Email/Password)',
    to: '/auth/login',
    icon: 'i-lucide-key-square',
  },
  {
    label: tString('auth.loginWithMagicLink'),
    to: '/auth/magic-link',
    icon: 'i-lucide-mail',
  },
  {
    label: tString('auth.loginWithPasskey'),
    to: '/auth/login-passkey',
    icon: 'i-lucide-fingerprint',
  },
  {
    label: tString('auth.socialLogin'),
    to: '/auth/social-login',
    icon: 'i-lucide-twitter',
  },
  {
    label: tString('auth.phoneNumberLogin'),
    to: '/auth/login-phone',
    icon: 'i-lucide-phone',
  },
  {
    label: tString('auth.register'),
    to: '/auth/register',
    icon: 'i-lucide-user-plus',
  },
])

const schema = z.object({
  email: z.string().email(tString('validation.invalidEmail')),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined,
})
const isSubmitting = ref(false)
const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isSubmitting.value = true
    await $fetch('/api/subscribe', {
      method: 'POST',
      body: {
        email: event.data.email,
      },
    })
    toast.add({
      title: tString('messages.success'),
      description: 'The form has been submitted.',
      color: 'success',
    })
  } catch (error) {
    const msg = (error as { data: { message: string } }).data.message.includes(
      'D1_ERROR: UNIQUE constraint failed: subscribers.email: SQLITE_CONSTRAINT',
    )
      ? 'You are already subscribed to our newsletter.'
      : tString('errors.unexpectedError')
    toast.add({
      title: tString('messages.error'),
      description: msg,
      color: 'error',
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>
