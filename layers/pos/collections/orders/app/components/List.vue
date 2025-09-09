<template>
  <CrudTable
    collection="posOrders"
    :columns="columns"
    :rows="collectionPosOrders"
  >
    <template #header>
      <CrudTableHeader
        title="PosOrders"
        :collection="'posOrders'"
        createButton
      />
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { columns } = usePosOrders()
const { currentTeam } = useTeam()
const { posOrders: collectionPosOrders } = useCollections()

const { data: orders, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/pos-orders`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched orders to the collection
if (orders.value) {
  collectionPosOrders.value = orders.value
}
</script>