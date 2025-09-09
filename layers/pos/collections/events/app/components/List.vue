<template>
  <CrudTable
    collection="posEvents"
    :columns="columns"
    :rows="collectionPosEvents"
  >
    <template #header>
      <CrudTableHeader
        title="PosEvents"
        :collection="'posEvents'"
        createButton
      />
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { columns } = usePosEvents()
const { currentTeam } = useTeam()
const { posEvents: collectionPosEvents } = useCollections()

const { data: events, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/pos-events`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched events to the collection
if (events.value) {
  collectionPosEvents.value = events.value
}
</script>