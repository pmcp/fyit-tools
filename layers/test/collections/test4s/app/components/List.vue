<template>
  <CrudTable
    collection="test4s"
    :columns="columns"
    :rows="collectionTest4s"
  >
    <template #header>
      <CrudTableHeader
        title="Test4s"
        :collection="'test4s'"
        createButton
      />
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { columns } = useTest4s()
const { currentTeam } = useTeam()
const { test4s: collectionTest4s } = useCollections()

const { data: test4s, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/test4s`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched test4s to the collection
if (test4s.value) {
  collectionTest4s.value = test4s.value
}
</script>