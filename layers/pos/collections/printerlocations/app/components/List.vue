<template>
  <CrudTable
    collection="posPrinterLocations"
    :columns="columns"
    :rows="collectionPosPrinterLocations"
  >
    <template #header>
      <CrudTableHeader
        title="PosPrinterLocations"
        :collection="'posPrinterLocations'"
        createButton
      />
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { columns } = usePosPrinterLocations()
const { currentTeam } = useTeam()
const { posPrinterLocations: collectionPosPrinterLocations } = useCollections()

const { data: printerlocations, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/pos-printerlocations`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched printerlocations to the collection
if (printerlocations.value) {
  collectionPosPrinterLocations.value = printerlocations.value
}
</script>