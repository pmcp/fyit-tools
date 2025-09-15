
<template>
  <UDashboardPanel :id="collection || 'crud-table'">
    <template #header>
      <slot name="header"></slot>
    </template>

    <template #body>

      <!-- Filters -->
      <div class="flex items-center justify-between gap-3 px-4 py-3">
        <div class="flex items-center gap-1.5">
          <UInput v-model="search" icon="i-lucide-search" placeholder="Search..." class="max-w-sm" />
<!--          <UButton-->
<!--            icon="i-lucide-filter"-->
<!--            color="neutral"-->
<!--            variant="subtle"-->
<!--            size="sm"-->
<!--            :disabled="search === ''"-->
<!--            @click="resetFilters"-->
<!--          >-->
<!--            Reset-->
<!--          </UButton>-->
        </div>


        <div class="flex items-center gap-1.5">
          <UButton
            icon="i-lucide-trash"
            :color="selectedRows.length > 0 ? 'error' : 'neutral'"
            variant="subtle"
            size="sm"
            :disabled="selectedRows.length === 0"
            @click="open('delete', collection, selectedRows.map(row => row.id))"
          >
            Delete <span v-if="selectedRows.length > 0">{{ selectedRows.length }} <span>item<span v-if="selectedRows.length > 1">s</span></span></span>
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
              label="Display"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-settings-2"
            />
          </UDropdownMenu>
        </div>
      </div>

      <div class="relative">
        <!-- Loading overlay -->
        <div v-if="loadingPage" class="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-loader-2" class="animate-spin" />
            <span class="text-sm">Loading...</span>
          </div>
        </div>

        <UTable
          ref="table"
          v-model:row-selection="rowSelection"
          v-model:sort="sort"
          v-model:column-visibility="columnVisibility"
          :data="slicedRows"
          :columns="columnsTable"
          class="shrink-0"
          :class="{ 'opacity-50': loadingPage }"
          :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
            tbody: '[&>tr]:last:[&>td]:border-b-0',
            th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
            td: 'border-b border-default'
          }"
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
          @delete="open('delete', collection, [row.original.id])"
          :delete-loading="row.optimisticAction === 'delete'"
          update
          @update="open('update', collection, [row.original.id])"
          :update-loading="row.optimisticAction === 'update' || row.optimisticAction === 'create'"
        />
      </template>

<!--      <template #expand-cell="{ row }">-->
<!--        <UButton-->
<!--          color="gray"-->
<!--          variant="ghost"-->
<!--          icon="i-lucide-chevron-down"-->
<!--          size="xs"-->
<!--          square-->
<!--          @click="toggleExpanded(row.id)"-->
<!--          :class="expanded.includes(row.id) ? 'rotate-180' : ''"-->
<!--          class="transition-transform"-->
<!--        />-->
<!--      </template>-->

        </UTable>
      </div>



      <!-- Number of rows & Pagination -->
      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="flex items-center gap-1.5">
          <span class="text-sm text-muted">Rows per page:</span>
          <USelect
            label="Rows per page"
            v-model="pageCount"
            :items="[
              { label: '5', value: 5 },
              { label: '10', value: 10 },
              { label: '20', value: 20 },
              { label: '30', value: 30 },
              { label: '40', value: 40 }
            ]"
            class="w-20"
            size="xs"
          />
          <span class="text-sm text-muted">
            Showing
            <span class="font-medium">{{ pageFrom }}</span>
            to
            <span class="font-medium">{{ pageTo }}</span>
            of
            <span class="font-medium">{{ pageTotalToShow }}</span>
            results
          </span>
        </div>

        <div class="flex items-center gap-1.5">
          <UPagination
            :page="page"
            :items-per-page="pageCount"
            :total="pageTotalToShow"
            :disabled="loadingPage"
            @update:page="(val) => {
              console.log('[Table] UPagination page update:', val)
              page = val
            }"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script lang="ts" setup>
import { upperFirst } from 'scule'

const UCheckbox = resolveComponent('UCheckbox')

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
  },
  serverPagination: {
    type: Boolean,
    default: false
  },
  paginationData: {
    type: Object,
    default: null
  },
  refreshFn: {
    type: Function,
    default: null
  },
  hideDefaultColumns: {
    type: Object,
    default: () => ({
      created_at: false,
      updated_at: false,
      actions: false
    })
  }
})

const expanded = ref<(string | number)[]>([])

// Table ref for accessing table API
const table = useTemplateRef('table')

const allColumns = computed(() => {
  const columns = [
    {
      id: 'select',
      header: ({ table }) =>
        h(UCheckbox, {
          'modelValue': table.getIsSomePageRowsSelected()
            ? 'indeterminate'
            : table.getIsAllPageRowsSelected(),
          'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
            table.toggleAllPageRowsSelected(!!value),
          'ariaLabel': 'Select all'
        }),
      cell: ({ row }) =>
        h(UCheckbox, {
          'modelValue': row.getIsSelected(),
          'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
          'ariaLabel': 'Select row'
        })
    },
    ...props.columns
  ]

  // Conditionally add default columns based on hideDefaultColumns prop
  if (!props.hideDefaultColumns?.created_at) {
    columns.push({
      accessorKey: 'created_at',
      id: 'created_at',
      header: 'Created At',
      sortable: true
    })
  }

  if (!props.hideDefaultColumns?.updated_at) {
    columns.push({
      accessorKey: 'updated_at',
      id: 'updated_at',
      header: 'Updated At',
      sortable: true
    })
  }

  if (!props.hideDefaultColumns?.actions) {
    columns.push({
      accessorKey: 'actions',
      id: 'actions',
      header: 'Actions'
    })
  }

  // Always add expand column (usually hidden anyway)
  columns.push({
    accessorKey: 'expand',
    id: 'expand',
    header: ''
  })

  return columns
})


// ACTIONS
const { open, getCollection, setPagination, getPagination } = useCrud()

// Loading state for pagination
const loadingPage = ref(false)


// COLUMNS
// Initialize column visibility - hide 'id' column by default
const columnVisibility = ref<Record<string, boolean>>({
  id: false
})

const columnsTable = computed(() => {
  // Return all columns, visibility will be handled by the table component
  return allColumns.value
})

// ROWS
const rowSelection = ref({})
const selectedRows = computed(() => {
  if (!table.value?.tableApi) return []
  return table.value.tableApi.getFilteredSelectedRowModel().rows.map(row => row.original)
})




// PAGINATION
const sort = ref({ column: 'created_at', direction: 'desc' as 'asc' | 'desc' })
const page = ref(1)
const pageCount = ref(10)

// Initialize pagination from server if available
const serverPaginationData = computed(() => {
  if (!props.serverPagination) return null
  // Use passed pagination data if available, otherwise fall back to getPagination
  return props.paginationData || getPagination(props.collection)
})

// Use server pagination data if available
if (serverPaginationData.value) {
  page.value = serverPaginationData.value.currentPage || 1
  pageCount.value = serverPaginationData.value.pageSize || 10
}

const itemCountFromServer = computed(() => {
  if (props.serverPagination && serverPaginationData.value) {
    return serverPaginationData.value.totalItems || 0
  }
  return props.rows.length
})

const pageTotalFiltered = computed(() => searchedRows.value.length)

const pageTotalToShow = computed(() => {
  // For server pagination, always use server count
  if (props.serverPagination) {
    return itemCountFromServer.value
  }
  // For client-side pagination with search
  if(search.value === '') return itemCountFromServer.value
  return pageTotalFiltered.value
})

const pageFrom = computed(() => {
  if(pageTotalToShow.value === 0) return 0
  return (page.value - 1) * pageCount.value + 1
})
const pageTo = computed(() => {
  if (props.serverPagination) {
    // For server pagination, calculate based on actual rows returned
    return Math.min(page.value * pageCount.value, itemCountFromServer.value)
  }
  return Math.min(page.value * Number(pageCount.value), pageTotalToShow.value)
})





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
  // For server pagination, use rows directly (already paginated from server)
  if (props.serverPagination) {
    // When searching locally on server-paginated data
    if (search.value !== '') {
      return props.rows.filter((row) => {
        return Object.values(row).some((value) => {
          return String(value).toLowerCase().includes(search.value.toLowerCase())
        })
      })
    }
    return props.rows
  }

  // For client-side pagination
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

// Function to update pagination and fetch new data
async function fetchPage(newPage: number) {
  console.log('[Table] fetchPage called with:', { newPage, collection: props.collection })
  if (!props.serverPagination || !props.collection) return

  loadingPage.value = true
  try {
    // Update pagination state
    setPagination(props.collection, {
      currentPage: newPage,
      pageSize: pageCount.value,
      sortBy: sort.value.column,
      sortDirection: sort.value.direction
    })

    // Use refresh function if provided (from useCollection)
    if (props.refreshFn) {
      await props.refreshFn()
    } else {
      // Fallback to direct getCollection
      await getCollection(props.collection, {}, true)
    }
  } finally {
    loadingPage.value = false
  }
}

// Watch for page changes (server pagination)
watch(page, async (newPage, oldPage) => {
  console.log('[Table] page watch triggered:', { newPage, oldPage, serverPagination: props.serverPagination })
  if (props.serverPagination && newPage !== oldPage) {
    await fetchPage(newPage)
  }
})

// Watch for pageCount changes
watch(pageCount, async (newPageCount, oldPageCount) => {
  page.value = 1
  if (props.serverPagination && newPageCount !== oldPageCount) {
    await fetchPage(1)
  }
})

// Watch for sort changes (server pagination)
watch(sort, async (newSort, oldSort) => {
  if (props.serverPagination && (newSort.column !== oldSort.column || newSort.direction !== oldSort.direction)) {
    page.value = 1
    await fetchPage(1)
  }
}, { deep: true })

</script>
