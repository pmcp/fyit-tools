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
      <UFormField :label="t('pos.categories.fields.event')" name="eventId">
        <UInput v-model.number="state.eventId" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField :label="t('pos.categories.fields.color')" name="color">
        <UInput v-model="state.color" class="w-full" size="xl" />
      </UFormField>

      <UFormField :label="t('pos.categories.fields.icon')" name="icon">
        <UInput v-model="state.icon" class="w-full" size="xl" />
      </UFormField>

      <UFormField :label="t('pos.categories.fields.sortOrder')" name="sortOrder">
        <UInput v-model.number="state.sortOrder" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField :label="t('pos.categories.fields.isActive')" name="isActive">
        <UCheckbox v-model="state.isActive" />
      </UFormField>

      <!-- Translation fields -->
      <TranslationsInput
        v-model="state.translations"
        :fields="['name', 'description']"
        :default-values="{
          name: state.name
        }"
        :label="t('pos.categories.fields.translations')"
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
import type { PosCategorieFormProps, PosCategorieFormData } from '../../types'

const { send } = useCrud()
const { t } = useT()

const props = defineProps<PosCategorieFormProps>()

const { defaultValue, schema, collection } = usePosCategories()

// Create a reactive form state with proper typing

// Initialize form state with proper values (no watch needed!)
const initialValues = props.action === 'update' && props.activeItem?.id
  ? { ...defaultValue, ...props.activeItem }
  : { ...defaultValue }

const state = ref<PosCategorieFormData & { id?: string | null }>(initialValues)
</script>