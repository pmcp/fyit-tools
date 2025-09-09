<template>
  <CrudTable
    collection="posOrderProducts"
    :columns="columns"
    :rows="collectionPosOrderProducts"
  >
    <template #header>
      <CrudTableHeader
        title="PosOrderProducts"
        :collection="'posOrderProducts'"
        createButton
      />
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { columns } = usePosOrderProducts()
const { currentTeam } = useTeam()
const { posOrderProducts: collectionPosOrderProducts } = useCollections()

const { data: orderproducts, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/pos-orderproducts`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched orderproducts to the collection
if (orderproducts.value) {
  collectionPosOrderProducts.value = orderproducts.value
}
</script>