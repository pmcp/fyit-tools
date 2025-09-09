<template>
  <CrudTable
    collection="posCategories"
    :columns="columns"
    :rows="collectionPosCategories"
  >
    <template #header>
      <CrudTableHeader
        title="PosCategories"
        :collection="'posCategories'"
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
const { t } = useTrans()
const { locale } = useI18n()
const { columns } = usePosCategories()
const { currentTeam } = useTeam()
const { posCategories: collectionPosCategories } = useCollections()

const { data: categories, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/pos-categories`,
  {
    query: { locale: locale.value },
    watch: [currentTeam, locale],
  },
)

// Directly assign the fetched categories to the collection
if (categories.value) {
  collectionPosCategories.value = categories.value
}
</script>