<template>
  <CrudTable
    collection="items"
    :columns="columns"
    :rows="collectionItems"
  >
    <template #header>
      <CrudTableHeader
        collection="items"
        title="Items"
      />
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
import { itemsColumns } from '../composables/useItems'

const collections = useCollections()
const collectionItems = computed(() => collections.items.value || [])
const columns = itemsColumns
</script>