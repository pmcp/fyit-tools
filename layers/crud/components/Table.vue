
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

      <UTable
        ref="table"
        v-model:row-selection="rowSelection"
        v-model:sort="sort"
        v-model:column-visibility="columnVisibility"
        :data="slicedRows"
        :columns="columnsTable"
        class="shrink-0"
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
          @delete="open('delete', collection, [row.id])"
          :delete-loading="row.optimisticAction === 'delete'"
          update
          @update="open('update', collection, [row.id])"
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
            v-model="page"
            :items-per-page="pageCount"
            :total="pageTotalToShow"
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
  }
})

const expanded = ref<(string | number)[]>([])

// Table ref for accessing table API
const table = useTemplateRef('table')

const allColumns = [
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
const rowSelection = ref({})
const selectedRows = computed(() => {
  if (!table.value?.tableApi) return []
  return table.value.tableApi.getFilteredSelectedRowModel().rows.map(row => row.original)
})




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
