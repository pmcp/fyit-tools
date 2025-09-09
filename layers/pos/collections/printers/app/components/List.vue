<template>
  <CrudTable
    collection="posPrinters"
    :columns="columns"
    :rows="collectionPosPrinters"
  >
    <template #header>
      <CrudTableHeader
        title="PosPrinters"
        :collection="'posPrinters'"
        createButton
      />
    </template>
    <template #name-data="{ row }">
      {{ t(row, 'name') }}
    </template>
    <template #statusMessage-data="{ row }">
      {{ t(row, 'statusMessage') }}
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { t } = useEntityTranslations()
const { locale } = useI18n()
const { columns } = usePosPrinters()
const { currentTeam } = useTeam()
const { posPrinters: collectionPosPrinters } = useCollections()

const { data: printers, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/pos-printers`,
  {
    query: { locale: locale.value },
    watch: [currentTeam, locale],
  },
)

// Directly assign the fetched printers to the collection
if (printers.value) {
  collectionPosPrinters.value = printers.value
}
</script>