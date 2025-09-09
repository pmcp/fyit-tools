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
  </CrudTable>
</template>

<script setup lang="ts">
const { columns } = usePosProducts()
const { currentTeam } = useTeam()
const { posProducts: collectionPosProducts } = useCollections()

const { data: products, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/pos-products`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched products to the collection
if (products.value) {
  collectionPosProducts.value = products.value
}
</script>