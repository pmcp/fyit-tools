<template>
  <CrudTable
    collection="products"
    :columns="columns"
    :rows="collectionProducts"
  >
    <template #header>
      <CrudTableHeader
        title="Products"
        :collection="'products'"
        createButton
      />
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { columns } = useProducts()
const { currentTeam } = useTeam()
const { products: collectionProducts } = useCollections()

const { data: products, refresh } = await useFetch(
  `/api/teams/${currentTeam.value.id}/products`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched products to the collection
if (products.value) {
  collectionProducts.value = products.value
}
</script>