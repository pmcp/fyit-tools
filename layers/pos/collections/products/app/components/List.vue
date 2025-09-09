<template>
  <CrudTable
    collection="posProducts"
    :columns="columns"
    :rows="collectionPosProducts"
  >
    <template #header>
      <CrudTableHeader
        title="PosProducts"
        :collection="'posProducts'"
        createButton
      />
    </template>
    <template #name-data="{ row }">
      {{ t(row, 'name') }}
    </template>
    <template #description-data="{ row }">
      {{ t(row, 'description') }}
    </template>
    <template #remarkPrompt-data="{ row }">
      {{ t(row, 'remarkPrompt') }}
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { t } = useEntityTranslations()
const { locale } = useI18n()
const { columns } = usePosProducts()
const { currentTeam } = useTeam()
const { posProducts: collectionPosProducts } = useCollections()

const { data: products, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/pos-products`,
  {
    query: { locale: locale.value },
    watch: [currentTeam, locale],
  },
)

// Directly assign the fetched products to the collection
if (products.value) {
  collectionPosProducts.value = products.value
}
</script>