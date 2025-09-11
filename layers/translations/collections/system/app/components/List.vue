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

const { data: systemTranslations, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/translations-workspace`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched system translation to the collection
if (systemTranslations.value) {
  collectionTranslationsSystem.value = systemTranslations.value
}
</script>
