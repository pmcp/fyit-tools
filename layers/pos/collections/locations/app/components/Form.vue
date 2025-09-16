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

      <UFormField :label="t('pos.locations.fields.isActive')" name="isActive">
        <UCheckbox v-model="state.isActive" />
      </UFormField>

      <UFormField label="PrinterMode" name="printerMode">
        <UInput v-model="state.printerMode" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="MaxRetryAttempts" name="maxRetryAttempts">
        <UInput v-model.number="state.maxRetryAttempts" type="number" class="w-full" size="xl" />
      </UFormField>

      <!-- Translation fields -->
      <TranslationsInput
        v-model="state.translations"
        :fields="['name', 'description']"
        :default-values="{
          name: state.name,
          description: state.description
        }"
        :label="t('pos.locations.fields.translations')"
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
import type { PosLocationFormProps, PosLocationFormData } from '../../types'

const { send } = useCrud()
const { t } = useT()

const props = defineProps<PosLocationFormProps>()

const { defaultValue, schema, collection } = usePosLocations()

// Create a reactive form state with proper typing

// Initialize form state with proper values (no watch needed!)
const initialValues = props.action === 'update' && props.activeItem?.id
  ? { ...defaultValue, ...props.activeItem }
  : { ...defaultValue }

const state = ref<PosLocationFormData & { id?: string | null }>(initialValues)
</script>