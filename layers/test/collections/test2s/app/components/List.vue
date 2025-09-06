<template>
  <CrudTable
    collection="test2s"
    :columns="columns"
    :rows="collectionTest2s"
  >
    <template #header>
      <CrudTableHeader
        title="Test2s"
        :collection="'test2s'"
        createButton
      />
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { columns } = useTest2s()
const { currentTeam } = useTeam()
const { test2s: collectionTest2s } = useCollections()

const { data: test2s, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/test2s`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched test2s to the collection
if (test2s.value) {
  collectionTest2s.value = test2s.value
}
</script>