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

      <UFormField :label="t('pos.printers.fields.ipAddress')" name="ipAddress">
        <UInput v-model="state.ipAddress" class="w-full" size="xl" />
      </UFormField>

      <UFormField :label="t('pos.printers.fields.port')" name="port">
        <UInput v-model.number="state.port" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Status" name="status">
        <UInput v-model.number="state.status" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="ShowPrices" name="showPrices">
        <UCheckbox v-model="state.showPrices" />
      </UFormField>

      <UFormField :label="t('pos.printers.fields.location')" name="locationId">
        <UInput v-model.number="state.locationId" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Priority" name="priority">
        <UInput v-model.number="state.priority" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="HealthStatus" name="healthStatus">
        <UInput v-model="state.healthStatus" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="LastSuccessAt" name="lastSuccessAt">
        <UInput v-model="state.lastSuccessAt" type="datetime-local" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="LastFailureAt" name="lastFailureAt">
        <UInput v-model="state.lastFailureAt" type="datetime-local" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="ConsecutiveFailures" name="consecutiveFailures">
        <UInput v-model.number="state.consecutiveFailures" type="number" class="w-full" size="xl" />
      </UFormField>

      <!-- Translation fields -->
      <TranslationsInput
        v-model="state.translations"
        :fields="['name', 'statusMessage']"
        :default-values="{
          name: state.name
        }"
        :label="t('pos.printers.fields.translations')"
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
import type { PosPrinterFormProps, PosPrinterFormData } from '../../types'

const { send } = useCrud()
const { t } = useT()

const props = defineProps<PosPrinterFormProps>()

const { defaultValue, schema, collection } = usePosPrinters()

// Create a reactive form state with proper typing

// Initialize form state with proper values (no watch needed!)
const initialValues = props.action === 'update' && props.activeItem?.id
  ? { ...defaultValue, ...props.activeItem }
  : { ...defaultValue }

const state = ref<PosPrinterFormData & { id?: string | null }>(initialValues)
</script>