<template>
  <CrudTable
    collection="posLocations"
    :columns="columns"
    :rows="collectionPosLocations"
  >
    <template #header>
      <CrudTableHeader
        title="PosLocations"
        :collection="'posLocations'"
        createButton
      />
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { columns } = usePosLocations()
const { currentTeam } = useTeam()
const { posLocations: collectionPosLocations } = useCollections()

const { data: locations, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/pos-locations`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched locations to the collection
if (locations.value) {
  collectionPosLocations.value = locations.value
}
</script>