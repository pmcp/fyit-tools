// Generator for List.vue component

export function generateListComponent(data) {
  const { plural, pascalCasePlural, layerPascalCase, layer } = data
  const prefixedPascalCasePlural = `${layerPascalCase}${pascalCasePlural}`
  const prefixedCamelCasePlural = `${layer}${pascalCasePlural}`
  const apiPath = `${layer}-${plural}`

  return `<template>
  <CrudTable
    collection="${prefixedCamelCasePlural}"
    :columns="columns"
    :rows="collection${prefixedPascalCasePlural}"
  >
    <template #header>
      <CrudTableHeader
        title="${prefixedPascalCasePlural}"
        :collection="'${prefixedCamelCasePlural}'"
        createButton
      />
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { columns } = use${prefixedPascalCasePlural}()
const { currentTeam } = useTeam()
const { ${prefixedCamelCasePlural}: collection${prefixedPascalCasePlural} } = useCollections()

const { data: ${plural}, refresh } = await useFetch(
  \`/api/teams/\${currentTeam.value.id}/${apiPath}\`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched ${plural} to the collection
if (${plural}.value) {
  collection${prefixedPascalCasePlural}.value = ${plural}.value
}
</script>`
}