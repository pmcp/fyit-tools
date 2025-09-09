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
    <template #name-data="{ row }">
      {{ t(row, 'name') }}
    </template>
    <template #description-data="{ row }">
      {{ t(row, 'description') }}
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { t } = useEntityTranslations()
const { locale } = useI18n()
const { columns } = usePosLocations()
const { currentTeam } = useTeam()
const { posLocations: collectionPosLocations } = useCollections()

const { data: locations, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/pos-locations`,
  {
    query: { locale: locale.value },
    watch: [currentTeam, locale],
  },
)

// Directly assign the fetched locations to the collection
if (locations.value) {
  collectionPosLocations.value = locations.value
}
</script>