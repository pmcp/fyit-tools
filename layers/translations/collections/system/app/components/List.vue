<template>
  <CrudTable
    collection="translationsSystem"
    :columns="columns"
    :rows="collectionTranslationsSystem"
  >
    <template #header>
      <CrudTableHeader
        title="System Translations"
        :collection="'translationsSystem'"
        createButton
      />
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { columns } = useTranslationsSystem()
const { currentTeam } = useTeam()
const { translationsSystem: collectionTranslationsSystem } = useCollections()

const { data: systemtranslations, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/translations-system`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched systemtranslations to the collection
if (systemtranslations.value) {
  collectionTranslationsSystem.value = systemtranslations.value
}
</script>