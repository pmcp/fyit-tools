<template>
  <CrudTable
    collection="posSystemLogs"
    :columns="columns"
    :rows="collectionPosSystemLogs"
  >
    <template #header>
      <CrudTableHeader
        title="PosSystemLogs"
        :collection="'posSystemLogs'"
        createButton
      />
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { columns } = usePosSystemLogs()
const { currentTeam } = useTeam()
const { posSystemLogs: collectionPosSystemLogs } = useCollections()

const { data: systemlogs, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/pos-systemlogs`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched systemlogs to the collection
if (systemlogs.value) {
  collectionPosSystemLogs.value = systemlogs.value
}
</script>