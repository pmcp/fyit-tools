<template>
  <CrudTable
    collection="test3s"
    :columns="columns"
    :rows="collectionTest3s"
  >
    <template #header>
      <CrudTableHeader
        title="Test3s"
        :collection="'test3s'"
        createButton
      />
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { columns } = useTest3s()
const { currentTeam } = useTeam()
const { test3s: collectionTest3s } = useCollections()

const { data: test3s, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/test3s`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched test3s to the collection
if (test3s.value) {
  collectionTest3s.value = test3s.value
}
</script>