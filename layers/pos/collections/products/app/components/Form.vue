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

      <!-- Translation fields -->
      <TranslationsInput
          v-model="state.translations"
          :fields="['name', 'description', 'remarkPrompt']"
          :default-values="{
          name: state.name,
          description: state.description,
          remarkPrompt: state.remarkPrompt
        }"
          @update:english="(data) => { state[data.field] = data.value }"
          :label="t('pos.products.fields.translations')"
      />

      <UFormField :label="t('pos.products.fields.event')" name="eventId">
        <CrudEntitySelect
          v-model="state.eventId"
          :label="t('pos.products.fields.event')"
          entity-type="event"
          collection="posEvents"
          api-path="pos-events"
        />
      </UFormField>

      <UFormField :label="t('pos.products.fields.category')" name="categoryId">
        <CrudEntitySelect
          v-model="state.categoryId"
          :label="t('pos.products.fields.category')"
          entity-type="category"
          collection="posCategories"
          api-path="pos-categories"
        />
      </UFormField>

      <UFormField :label="t('pos.products.fields.location')" name="locationId">
        <CrudEntitySelect
          v-model="state.locationId"
          :label="t('pos.products.fields.location')"
          entity-type="location"
          collection="posLocations"
          api-path="pos-locations"
        />
      </UFormField>

      <UFormField :label="t('pos.products.fields.price')" name="price">
        <UInput v-model.number="state.price" type="number" class="w-full" size="xl" />
      </UFormField>

      <UFormField :label="t('pos.products.fields.isActive')" name="isActive">
        <UCheckbox v-model="state.isActive" />
      </UFormField>

      <UFormField :label="t('pos.products.fields.isTemplate')" name="isTemplate">
        <UCheckbox v-model="state.isTemplate" />
      </UFormField>

      <UFormField :label="t('pos.products.fields.requiresRemark')" name="requiresRemark">
        <UCheckbox v-model="state.requiresRemark" />
      </UFormField>

      <UFormField :label="t('pos.products.fields.sortOrder')" name="sortOrder">
        <UInput v-model.number="state.sortOrder" type="number" class="w-full" size="xl" />
      </UFormField>

      <CrudButton
        :action="action"
        :collection="collection"
        :items="items"
        :loading="loading"
      />
    </UForm>
    <br>
  </div>
</template>

<script setup lang="ts">
import type { PosProductFormProps, PosProductFormData } from '../../types'

const { send } = useCrud()
const { t } = useT()

const props = defineProps<PosProductFormProps>()

const { defaultValue, schema, collection } = usePosProducts()

// Create a reactive form state with proper typing

// Initialize form state with proper values (no watch needed!)
const initialValues = props.action === 'update' && props.activeItem?.id
  ? { ...defaultValue, ...props.activeItem }
  : { ...defaultValue }

const state = ref<PosProductFormData & { id?: string | null }>(initialValues)
</script>
