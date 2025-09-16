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
      <UFormField label="EventId" name="eventId">
        <UInput v-model.number="state.eventId" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Name" name="name">
        <UInput v-model="state.name" class="w-full" size="xl" />
      </UFormField>

      <UFormField :label="t('pos.clients.fields.email')" name="email">
        <UInput v-model="state.email" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Active" name="active">
        <UCheckbox v-model="state.active" />
      </UFormField>

      <UFormField label="IsGlobal" name="isGlobal">
        <UCheckbox v-model="state.isGlobal" />
      </UFormField>

      <!-- Translation fields -->
      <TranslationsInput
        v-model="state.translations"
        :fields="['notes', 'description']"
        :default-values="{
          notes: state.notes,
          description: state.description
        }"
        :label="t('pos.clients.fields.translations')"
        @update:english="(data) => { state[data.field] = data.value }"
      />

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
import type { PosClientFormProps, PosClientFormData } from '../../types'

const { send } = useCrud()
const { t } = useT()

const props = defineProps<PosClientFormProps>()

const { defaultValue, schema, collection } = usePosClients()

// Create a reactive form state with proper typing

// Initialize form state with proper values (no watch needed!)
const initialValues = props.action === 'update' && props.activeItem?.id
  ? { ...defaultValue, ...props.activeItem }
  : { ...defaultValue }

const state = ref<PosClientFormData & { id?: string | null }>(initialValues)
</script>