<template>
  <CrudTable
    collection="posts"
    :columns="columns"
    :rows="collectionPosts"
  >
    <template #header>
      <CrudTableHeader
        title="Posts"
        :collection="'posts'"
        createButton
      />
    </template>

    <template #id-cell="{ row }">
      <USkeleton v-if="row.optimisticAction" class="h-6 w-40" />
      <span v-else>{{ row.id }}</span>
    </template>


  </CrudTable>
</template>

<script setup lang="ts">
import type { Post } from '../../types'
const { columns } = usePosts()
const { currentTeam } = useTeam()
const { posts: collectionPosts } = useCollections()

const { data: posts, refresh } = await useFetch<Post[]>(
  `/api/teams/${currentTeam.value.id}/posts`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched posts to the collection
if (posts.value) {
  collectionPosts.value = posts.value
}
</script>
