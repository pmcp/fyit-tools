
<template>
  <UCard
    class="w-full h-full"
    :ui="{
      base: '',
      ring: '',
      divide: 'divide-y divide-gray-200 dark:divide-gray-700',
      header: { padding: 'px-4 py-5' },
      body: { padding: '', base: 'min-h-[50vh] w-full divide-y divide-gray-200 dark:divide-gray-700' },
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
      <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Search..." />
      <slot name="searchbar"/>
      <div class="flex items-center gap-1.5">
        <UButton
          icon="i-heroicons-funnel"
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
      v-model="selectedRows"
      v-model:expand="expanded"
      v-model:sorting="sorting"
      :data="slicedRows"
      :columns="allColumns"
      sort-mode="manual"
      class="overflow-x-auto"
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
        {{ useDateFormat(row.date, 'DD-MM-YYYY') }}
      </template>

      <template #updated_at-cell="{ row }">
        {{ useDateFormat(row.date, 'DD-MM-YYYY') }}
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

    </UTable>

    <!-- Header and Action buttons -->
    <div class="flex justify-between items-center w-full px-4 py-3">
      <div class="flex items-center gap-1.5">
        <span class="text-sm leading-5">Rows per page:</span>
        <USelect
          v-model="pageCount"
          :options="[3, 5, 10, 20, 30, 40]"
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


        <UPopover :content="{ side: 'bottom', align: 'start' }">
          <UButton
            icon="i-heroicons-view-columns"
            color="gray"
            size="xs"
          >
            Columns
          </UButton>

          <template #content>
            <UCommandPalette
              v-model="selectedColumns"
              multiple
              placeholder="Search columns..."
              :groups="[{ id: 'labels', excludeSelectColumn }]"
              :ui="{ input: '[&>input]:h-8 [&>input]:text-sm' }"
            />

          </template>
        </UPopover>




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

<!--        <UPagination-->
<!--          v-model="page"-->
<!--          :page-count="Number(pageTo)"-->
<!--          :total="pageTotalToShow"-->
<!--          :ui="{-->
<!--            wrapper: 'flex items-center gap-1',-->
<!--            rounded: '!rounded-full min-w-[32px] justify-center',-->
<!--            default: {-->
<!--              activeButton: {-->
<!--                variant: 'outline',-->
<!--              }-->
<!--            }-->
<!--          }"-->
<!--        />-->
      </div>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
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

const expanded = ref({ 1: true })

const sorting = ref([
  {
    id: 'created_at',
    desc: false
  }
])
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')

const allColumns = [
  ...props.columns,
  {
    accessorKey: 'created_at',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Created At',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }

  },
  {
    accessorKey: 'updated_at',
    header: 'Updated At'
  },
  {
    id: 'expand',
    cell: ({ row }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-lucide-chevron-down',
        square: true,
        'aria-label': 'Expand',
        ui: {
          leadingIcon: [
            'transition-transform',
            row.getIsExpanded() ? 'duration-200 rotate-180' : ''
          ]
        },
        onClick: () => row.toggleExpanded()
      })
  },

]


// ACTIONS
const { open } = useCrud()


// COLUMNS
const columnsToShow = computed(() => props.columns.filter(column => column.key !== 'id'))
const selectedColumns = ref(columnsToShow.value)
// const selectedColumns = ref(props.columns)
const columnsTable = computed(() => props.columns.filter(column => selectedColumns.value.includes(column)))
const excludeSelectColumn = computed(() => props.columns.filter(v => v.key !== 'select'))

// ROWS
const selectedRows = useState('selectedRows', () => [])




// PAGINATION
const sort = ref({ column: 'id', direction: 'asc' as const })
const page = ref(1)
const pageCount = ref(3)
const itemCountFromServer = computed(() => useCrud().pagination.value[props.collection] ? useUserSettings().pagination.value[props.collection].totalItems : 0)
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
  if(!searchedRows.value || !Array.isArray(searchedRows.value) || searchedRows.value.length === 0) return []
  return searchedRows.value.slice((page.value - 1) * pageCount.value, (page.value) * pageCount.value)
})


// EXPAND ITEMS
const expand = ref({
  openedRows: [],
  row: {}
})


</script>
