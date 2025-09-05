<template>
  <CrudTable
    collection="tasks"
    :columns="columns"
    :rows="collectionTasks"
  >
    <template #header>
      <CrudTableHeader
        title="Tasks"
        :collection="'tasks'"
        createButton
      />
    </template>

    <template #id-cell="{ row }">
      <USkeleton v-if="row.optimisticAction" class="h-6 w-40" />
      <span v-else>{{ row.id }}</span>
    </template>

    <template #status-cell="{ row }">
      <UBadge 
        :color="getStatusColor(row.status)" 
        variant="subtle"
      >
        {{ formatStatus(row.status) }}
      </UBadge>
    </template>

    <template #priority-cell="{ row }">
      <UBadge 
        :color="getPriorityColor(row.priority)" 
        variant="solid"
      >
        {{ row.priority }}
      </UBadge>
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
import type { Task } from '../types'

const { columns } = useTasks()
const { currentTeam } = useTeam()
const { tasks: collectionTasks } = useCollections()

const { data: tasks, refresh } = await useFetch<Task[]>(
  `/api/teams/${currentTeam.value.id}/tasks`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched tasks to the collection
if (tasks.value) {
  collectionTasks.value = tasks.value
}

// Helper functions for formatting
const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    'todo': 'To Do',
    'in_progress': 'In Progress',
    'done': 'Done'
  }
  return statusMap[status] || status
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'todo': 'gray',
    'in_progress': 'blue',
    'done': 'green'
  }
  return colorMap[status] || 'gray'
}

const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    'low': 'gray',
    'medium': 'yellow',
    'high': 'red'
  }
  return colorMap[priority] || 'gray'
}
</script>