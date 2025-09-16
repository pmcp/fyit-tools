<template>
  <div v-if="loading === 'notLoading'">
    <!-- DELETE BUTTON-->
    <CrudButton
      v-if="action === 'delete'"
      :action="action"
      :collection="collection"
      :items="items"
      :loading="loading"
    />

    <!-- FORM FOR EDIT OR CREATE -->
    <UForm
      v-else
      :schema="schema"
      :state="state"
      class="space-y-4 flex flex-col justify-between h-full gap-4"
      @submit="send(action, collection, state.value)"
      size="lg"
    >
      <UFormField label="LogType" name="logType">
        <UInput v-model="state.logType" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Message" name="message">
        <UTextarea v-model="state.message" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Metadata" name="metadata">
        <UInput v-model="state.metadata" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="EventId" name="eventId">
        <UInput v-model.number="state.eventId" type="number" class="w-full" size="xl" />
      </UFormField>

      <CrudButton
        :action="action"
        :collection="collection"
        :items="items"
        :loading="loading"
      />
    </UForm>
  </div>
</template>

<script setup lang="ts">
import type { PosSystemLogFormProps, PosSystemLogFormData } from '../../types'

const { send } = useCrud()

const props = defineProps<PosSystemLogFormProps>()

const { defaultValue, schema, collection } = usePosSystemLogs()

// Create a reactive form state with proper typing

// Initialize form state with proper values (no watch needed!)
const initialValues = props.action === 'update' && props.activeItem?.id
  ? { ...defaultValue, ...props.activeItem }
  : { ...defaultValue }

const state = ref<PosSystemLogFormData & { id?: string | null }>(initialValues)
</script>