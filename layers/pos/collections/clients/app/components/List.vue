<template>
  <CrudTable
    collection="posClients"
    :columns="columns"
    :rows="collectionPosClients"
  >
    <template #header>
      <CrudTableHeader
        title="PosClients"
        :collection="'posClients'"
        createButton
      />
    </template>
    <template #notes-data="{ row }">
      {{ t(row, 'notes') }}
    </template>
    <template #description-data="{ row }">
      {{ t(row, 'description') }}
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { t } = useEntityTranslations()
const { locale } = useI18n()
const { columns } = usePosClients()
const { currentTeam } = useTeam()
const { posClients: collectionPosClients } = useCollections()

const { data: clients, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/pos-clients`,
  {
    query: { locale: locale.value },
    watch: [currentTeam, locale],
  },
)

// Directly assign the fetched clients to the collection
if (clients.value) {
  collectionPosClients.value = clients.value
}
</script>