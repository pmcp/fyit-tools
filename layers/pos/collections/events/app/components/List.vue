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
    <template #name-data="{ row }">
      {{ t(row, 'name') }}
    </template>
    <template #description-data="{ row }">
      {{ t(row, 'description') }}
    </template>
    <template #terms-data="{ row }">
      {{ t(row, 'terms') }}
    </template>
    <template #conditions-data="{ row }">
      {{ t(row, 'conditions') }}
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { t } = useTrans()
const { locale } = useI18n()
const { columns } = usePosEvents()
const { currentTeam } = useTeam()
const { posEvents: collectionPosEvents } = useCollections()

const { data: events, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/pos-events`,
  {
    query: { locale: locale.value },
    watch: [currentTeam, locale],
  },
)

// Directly assign the fetched events to the collection
if (events.value) {
  collectionPosEvents.value = events.value
}
</script>