<template>
  <CrudTable
    collection="test1s"
    :columns="columns"
    :rows="collectionTest1s"
  >
    <template #header>
      <CrudTableHeader
        title="Test1s"
        :collection="'test1s'"
        createButton
      />
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { columns } = useTest1s()
const { currentTeam } = useTeam()
const { test1s: collectionTest1s } = useCollections()

const { data: test1s, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/test1s`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched test1s to the collection
if (test1s.value) {
  collectionTest1s.value = test1s.value
}
</script>