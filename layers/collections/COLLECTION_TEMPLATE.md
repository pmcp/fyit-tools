# Creating a New Collection

To add a new collection to the CRUD system, follow this template:

## 1. Create the folder structure
```
layers/collections/[collection-name]/
├── composables/
│   └── use[CollectionName].ts
├── components/
│   ├── Form.vue
│   └── List.vue
├── types.ts
└── nuxt.config.ts
```

## 2. Create the composable config (`composables/use[CollectionName].ts`)
```typescript
import { z } from "zod";

export const [collectionName]Config = {
  name: '[collection-name]',  // Must match folder name
  apiPath: '[collection-name]',
  componentName: '[CollectionName]Form',  // Must match prefix in nuxt.config
  
  schema: z.object({
    // Define your fields here
  }),
  
  defaultValues: {
    // Default values for create form
  },
  
  columns: [
    // Table column definitions
    { accessorKey: 'field', header: 'Field Name', sortable: true },
    { accessorKey: 'actions', header: 'Actions' }
  ],
  
  // Optional: modalConfig for custom modal settings
  // modalConfig: { component: 'UModal', props: { size: 'lg' } },
  
  transformForApi: (data: any) => data,
  transformFromApi: (data: any) => data,
}

export default function () {
  return {
    defaultValue: [collectionName]Config.defaultValues,
    schema: [collectionName]Config.schema,
    columns: [collectionName]Config.columns
  }
}
```

## 3. Create types (`types.ts`)
```typescript
import { z } from 'zod'
import { [collectionName]Config } from './composables/use[CollectionName]'

export type [CollectionName]FormData = z.infer<typeof [collectionName]Config.schema>

export interface [CollectionName] extends [CollectionName]FormData {
  id: string
  teamId: string
  userId: string
  createdAt?: string
  updatedAt?: string
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export interface [CollectionName]FormProps {
  items: string[]
  activeItem: [CollectionName] | Record<string, never>
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}
```

## 4. Create the Form component (`components/Form.vue`)
```vue
<template>
  <div v-if="loading === 'notLoading'">
    <CrudButton
      v-if="action === 'delete'"
      :action="action"
      :collection="collection"
      :items="items"
      :loading="loading"
    />

    <UForm
      v-else
      :schema="schema"
      :state="state"
      class="space-y-4 flex flex-col justify-between h-full gap-4"
      @submit="send(action, collection, state)"
      size="lg"
    >
      <!-- Add your form fields here -->
      <UFormField label="Field Name" name="fieldName">
        <UInput v-model="state.fieldName" class="w-full" size="xl" />
      </UFormField>

      <CrudButton
        :action="action"
        :collection="collection"
        :items="items"
        :loading="loading"
      />
    </UForm>
  </div>
</template>

<script setup lang="ts">
import type { [CollectionName]FormProps, [CollectionName]FormData } from '../types'

const { send } = useCrud()
const props = defineProps<[CollectionName]FormProps>()
const { defaultValue, schema } = use[CollectionName]()

const state = reactive<[CollectionName]FormData & { id?: string | null }>({
  id: null,
  ...defaultValue
})

const getInitialValues = () => {
  if (props.action === 'update' && 'id' in props.activeItem && props.activeItem.id) {
    return { ...props.activeItem }
  } else if (props.action === 'create') {
    return { ...defaultValue }
  }
  return {}
}

watchEffect(() => {
  Object.assign(state, getInitialValues())
})
</script>
```

## 5. Create the List component (`components/List.vue`)
```vue
<template>
  <CrudTable
    collection="[collection-name]"
    :columns="columns"
    :rows="collection[CollectionName]"
  >
    <template #header>
      <CrudTableHeader
        title="[Collection Title]"
        :collection="'[collection-name]'"
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
import type { [CollectionName] } from '../types'

const { columns } = use[CollectionName]()
const { currentTeam } = useTeam()
const { [collectionName]: collection[CollectionName] } = useCollections()

const { data: [collectionName] } = await useFetch<[CollectionName][]>(
  `/api/teams/${currentTeam.value.id}/[collection-name]`,
  { watch: [currentTeam] }
)

if ([collectionName].value) {
  collection[CollectionName].value = [collectionName].value
}
</script>
```

## 6. Create nuxt.config.ts
```typescript
import { basename } from 'path'

const layerName = basename(__dirname)

export default defineNuxtConfig({
  components: {
    dirs: [
      {
        path: './components',
        prefix: layerName,
        global: true
      }
    ]
  }
})
```

## That's it! 
The collection will be automatically discovered and registered. No manual registration needed.

## Naming Convention Summary
- Folder: `layers/collections/tasks/`
- Config name: `tasksConfig` with `name: 'tasks'`
- Component prefix: `Tasks` (becomes `TasksForm`, `TasksList`)
- Type names: `Task`, `TaskFormData`, `TaskFormProps`
- Composable: `useTasks()`