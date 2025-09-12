
<template>
  <UCard
    class="w-full h-full flex flex-col"
    :ui="{
      base: 'flex flex-col h-full',
      ring: '',
      divide: 'divide-y divide-gray-200 dark:divide-gray-700',
      header: { padding: 'px-4 py-5' },
      body: { padding: '', base: 'flex-1 overflow-auto w-full divide-y divide-gray-200 dark:divide-gray-700' },
      footer: { padding: 'p-4' }
    }"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <slot name="header"></slot>
      </div>

    </template>

    <!-- Filters -->
    <div class="flex items-center justify-between gap-3 px-4 py-3">
      <UInput v-model="search" icon="i-lucide-search" placeholder="Search..." />
      <slot name="searchbar"/>
      <div class="flex items-center gap-1.5">
        <UButton
          icon="i-lucide-filter"
          color="gray"
          size="sm"
          :disabled="search === ''"
          @click="resetFilters"
        >
          Reset
        </UButton>
      </div>
    </div>

    <UTable
      ref="table"
      v-model="selectedRows"
      v-model:sort="sort"
      v-model:column-visibility="columnVisibility"
      :data="slicedRows"
      :columns="columnsTable"
      class="w-full"
    >
      <template #expanded="{ row }">
        <pre>{{ row }}</pre>
      </template>

      <!-- This passes the slots from the parent of this component to the child of this component  -->
      <template v-for="(_, slot) of $slots" #[slot]="scope">
        <slot :name="slot" v-bind="scope" />
      </template>

      <!-- Default column slots -->
      <template #created_at-cell="{ row }">
        {{ row.original.createdAt ? useDateFormat(row.original.createdAt, 'DD-MM-YYYY') : '' }}
      </template>

      <template #updated_at-cell="{ row }">
        {{ row.original.updatedAt ? useDateFormat(row.original.updatedAt, 'DD-MM-YYYY') : '' }}
      </template>

      <template #actions-cell="{ row }">
        <CrudMiniButtons
          delete
          @delete="open('delete', collection, [row.id])"
          :delete-loading="row.optimisticAction === 'delete'"
          update
          @update="open('update', collection, [row.id])"
          :update-loading="row.optimisticAction === 'update' || row.optimisticAction === 'create'"
        />
      </template>

      <template #expand-cell="{ row }">
        <UButton
          color="gray"
          variant="ghost"
          icon="i-lucide-chevron-down"
          size="xs"
          square
          @click="toggleExpanded(row.id)"
          :class="expanded.includes(row.id) ? 'rotate-180' : ''"
          class="transition-transform"
        />
      </template>

    </UTable>

    <!-- Header and Action buttons -->
    <div class="flex justify-between items-center w-full px-4 py-3">
      <div class="flex items-center gap-1.5">
        <span class="text-sm leading-5">Rows per page:</span>
        <USelect
          v-model="pageCount"
          :options="[
            { label: '3', value: 3 },
            { label: '5', value: 5 },
            { label: '10', value: 10 },
            { label: '20', value: 20 },
            { label: '30', value: 30 },
            { label: '40', value: 40 }
          ]"
          class="me-2 w-20"
          size="xs"
        />
      </div>


      <div class="flex gap-1.5 items-center">

        <UButton
          v-if="selectedRows.length > 0"
          icon="i-ph-trash-duotone"
          color="rose"
          variant="soft"
          size="xs"
          @click="open('delete', collection, selectedRows.map(row => row.id))"
        >

          Delete {{ selectedRows.length }} <span>item<span v-if="selectedRows.length > 1">s</span></span>
        </UButton>


        <UDropdownMenu
          :items="
            table?.tableApi
              ?.getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => ({
                label: upperFirst(column.id),
                type: 'checkbox' as const,
                checked: column.getIsVisible(),
                onUpdateChecked(checked: boolean) {
                  table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                },
                onSelect(e?: Event) {
                  e?.preventDefault()
                }
              }))
          "
          :content="{ align: 'end' }"
        >
          <UButton
            label="Columns"
            icon="i-lucide-columns-3"
            color="gray"
            size="xs"
          />
        </UDropdownMenu>




      </div>
    </div>



    <!-- Number of rows & Pagination -->
    <template #footer>
      <div class="flex flex-wrap justify-between items-center">
        <div>
          <span class="text-sm leading-5">
            Showing
            <span class="font-medium">{{ pageFrom }}</span>
            to
            <span class="font-medium">{{ pageTo }}</span>
            of
            <span class="font-medium">{{ pageTotalToShow }}</span>
            results
          </span>
        </div>

        <UPagination
          v-model="page"
          :items-per-page="pageCount"
          :total="pageTotalToShow"
        />
      </div>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
import { upperFirst } from 'scule'
const props = defineProps({
  columns: {
    type: Array,
    default: []
  },
  rows: {
    type: Array,
    default: []
  },
  collection: {
    type: String,
    default: ''
  }
})

const expanded = ref<(string | number)[]>([])

// Table ref for accessing table API
const table = useTemplateRef('table')

const allColumns = [
  ...props.columns,
  {
    accessorKey: 'created_at',
    id: 'created_at',
    header: 'Created At',
    sortable: true
  },
  {
    accessorKey: 'updated_at',
    id: 'updated_at',
    header: 'Updated At',
    sortable: true
  },
  {
    accessorKey: 'actions',
    id: 'actions',
    header: 'Actions'
  },
  {
    accessorKey: 'expand',
    id: 'expand',
    header: ''
  }
]


// ACTIONS
const { open } = useCrud()


// COLUMNS
// Initialize column visibility - hide 'id' column by default
const columnVisibility = ref<Record<string, boolean>>({
  id: false
})

const columnsTable = computed(() => {
  // Return all columns, visibility will be handled by the table component
  return allColumns
})

// ROWS
const selectedRows = useState('selectedRows', () => [])




// PAGINATION
const sort = ref({ column: 'created_at', direction: 'desc' as 'asc' | 'desc' })
const page = ref(1)
const pageCount = ref(10)
const itemCountFromServer = computed(() => {
  const crudPagination = useCrud().pagination.value
  return crudPagination[props.collection]?.totalItems || props.rows.length
})
const pageTotalFiltered = computed(() => searchedRows.value.length)

const pageTotalToShow = computed(() => {
  if(search.value === '') return itemCountFromServer.value
  return pageTotalFiltered.value
})

const pageFrom = computed(() => {
  if(pageTotalToShow.value === 0) return 0
  return (page.value - 1) * pageCount.value + 1
})
const pageTo = computed(() => Math.min(page.value * Number(pageCount.value), pageTotalToShow.value))





// SEARCH
const search = ref('')
const resetFilters = () => {search.value = ''}

// TODO: Should do with new search, instead of just slicing
const searchedRows = computed(() => {
  if(search.value === '') return props.rows
  return props.rows.filter((row) => {
    return Object.values(row).some((value) => {
      return String(value).toLowerCase().includes(search.value.toLowerCase())
    })
  })
})

const slicedRows = computed(() => {
  console.log('searchedRows:', searchedRows.value)
  console.log('props.rows:', props.rows)
  if(!searchedRows.value || !Array.isArray(searchedRows.value) || searchedRows.value.length === 0) return []
  return searchedRows.value.slice((page.value - 1) * pageCount.value, (page.value) * pageCount.value)
})


// Expand toggle function
const toggleExpanded = (rowId: string | number) => {
  const index = expanded.value.indexOf(rowId)
  if (index > -1) {
    expanded.value.splice(index, 1)
  } else {
    expanded.value.push(rowId)
  }
}

// Watch for pageCount changes to reset page
watch(pageCount, () => {
  page.value = 1
})

</script>
