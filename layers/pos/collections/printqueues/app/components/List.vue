<template>
  <CrudTable
    collection="posPrintQueues"
    :columns="columns"
    :rows="collectionPosPrintQueues"
  >
    <template #header>
      <CrudTableHeader
        title="PosPrintQueues"
        :collection="'posPrintQueues'"
        createButton
      />
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { columns } = usePosPrintQueues()
const { currentTeam } = useTeam()
const { posPrintQueues: collectionPosPrintQueues } = useCollections()

const { data: printqueues, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/pos-printqueues`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched printqueues to the collection
if (printqueues.value) {
  collectionPosPrintQueues.value = printqueues.value
}
</script>