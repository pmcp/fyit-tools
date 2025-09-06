<template>
  <CrudTable
    collection="works"
    :columns="columns"
    :rows="collectionWorks"
  >
    <template #header>
      <CrudTableHeader
        title="Works"
        :collection="'works'"
        createButton
      />
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { columns } = useWorks()
const { currentTeam } = useTeam()
const { works: collectionWorks } = useCollections()

const { data: works, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/works`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched works to the collection
if (works.value) {
  collectionWorks.value = works.value
}
</script>