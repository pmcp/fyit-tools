<template>
  <CrudTable
    collection="events"
    :columns="columns"
    :rows="collectionEvents"
  >
    <template #header>
      <CrudTableHeader
        title="Events"
        :collection="'events'"
        createButton
      />
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { columns } = useEvents()
const { currentTeam } = useTeam()
const { events: collectionEvents } = useCollections()

const { data: events, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/events`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched events to the collection
if (events.value) {
  collectionEvents.value = events.value
}
</script>