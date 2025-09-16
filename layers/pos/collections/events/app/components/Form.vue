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
      <UFormField label="Slug" name="slug">
        <UInput v-model="state.slug" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="EventType" name="eventType">
        <UInput v-model="state.eventType" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Status" name="status">
        <UInput v-model="state.status" class="w-full" size="xl" />
      </UFormField>

      <UFormField :label="t('pos.events.fields.startDate')" name="startDate">
        <UInput v-model="state.startDate" type="datetime-local" class="w-full" size="xl" />
      </UFormField>

      <UFormField :label="t('pos.events.fields.endDate')" name="endDate">
        <UInput v-model="state.endDate" type="datetime-local" class="w-full" size="xl" />
      </UFormField>

      <UFormField :label="t('pos.events.fields.isActive')" name="isActive">
        <UCheckbox v-model="state.isActive" />
      </UFormField>

      <UFormField label="IsCurrent" name="isCurrent">
        <UCheckbox v-model="state.isCurrent" />
      </UFormField>

      <UFormField label="ArchivedAt" name="archivedAt">
        <UInput v-model="state.archivedAt" type="datetime-local" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="ParentEventId" name="parentEventId">
        <UInput v-model.number="state.parentEventId" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Metadata" name="metadata">
        <UInput v-model="state.metadata" class="w-full" size="xl" />
      </UFormField>

      <!-- Translation fields -->
      <TranslationsInput
        v-model="state.translations"
        :fields="['name', 'description', 'terms', 'conditions']"
        :default-values="{
          name: state.name,
          description: state.description
        }"
        :label="t('pos.events.fields.translations')"
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
import type { PosEventFormProps, PosEventFormData } from '../../types'

const { send } = useCrud()
const { t } = useT()

const props = defineProps<PosEventFormProps>()

const { defaultValue, schema, collection } = usePosEvents()

// Create a reactive form state with proper typing

// Initialize form state with proper values (no watch needed!)
const initialValues = props.action === 'update' && props.activeItem?.id
  ? { ...defaultValue, ...props.activeItem }
  : { ...defaultValue }

const state = ref<PosEventFormData & { id?: string | null }>(initialValues)
</script>