<template>
  <div>
    <CrudTableHeader 
      :title="'Works'"
      @create="() => crud.open('create', 'works')"
    />
    
    <CrudTable
      :items="items"
      :columns="config.columns"
      :loading="pending"
      @edit="(item) => crud.open('update', 'works', item)"
      @delete="(item) => crud.send('delete', 'works', {}, item.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { useWorks } from '../composables/useWorks'

const crud = useCrud()
const config = useWorks()
const team = useTeam()

const { data: items, pending, refresh } = await useFetch(`/api/teams/${team.value.id}/works`, {
  default: () => []
})

// Watch for CRUD operations to refresh
watch(() => crud.state.value.showCrud, (newVal) => {
  if (!newVal) refresh()
})
</script>