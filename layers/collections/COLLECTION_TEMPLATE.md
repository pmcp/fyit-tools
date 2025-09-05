# Creating a New Collection

To add a new collection to the CRUD system, follow this template:

## 1. Create the folder structure
```
layers/collections/[collection-name]/
├── app/
│   ├── composables/
│   │   └── use[CollectionName].ts
│   └── components/
│       ├── Form.vue
│       └── List.vue
├── server/
│   ├── api/
│   │   └── teams/
│   │       └── [id]/
│   │           └── [collection-name]/
│   │               ├── index.get.ts
│   │               ├── index.post.ts
│   │               ├── [[itemId]].patch.ts
│   │               └── [[itemId]].delete.ts
│   └── database/
│       └── queries.ts
├── types.ts
└── nuxt.config.ts
```

## 2. Create the composable config (`app/composables/use[CollectionName].ts`)
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
import { [collectionName]Config } from './app/composables/use[CollectionName]'

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

## 4. Create the Form component (`app/components/Form.vue`)
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
import type { [CollectionName]FormProps, [CollectionName]FormData } from '../../types'

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

## 5. Create the List component (`app/components/List.vue`)
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
import type { [CollectionName] } from '../../types'

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

## 6. Create the database queries (`server/database/queries.ts`)
```typescript
// Using the base CRUD utilities for standard operations
import {
  createGetAllQuery,
  createGetByIdsQuery,
  createInsertQuery,
  createUpdateQuery,
  createDeleteQuery,
  type CrudQueryOptions
} from '~~/layers/crud/server/database/baseCrudQueries'

const [collectionName]Options: CrudQueryOptions = {
  tableName: '[collection-name]',
  teamIdField: 'teamId',
  userIdField: 'userId',
  orderByField: 'createdAt',
  orderDirection: 'desc'
}

export const getAll[CollectionName] = createGetAllQuery([collectionName]Options)
export const get[CollectionName]ByIds = createGetByIdsQuery([collectionName]Options)
export const create[CollectionName] = createInsertQuery([collectionName]Options)
export const update[CollectionName] = createUpdateQuery([collectionName]Options)
export const delete[CollectionName] = createDeleteQuery([collectionName]Options)
```

## 7. Create API endpoints

### `server/api/teams/[id]/[collection-name]/index.get.ts`
```typescript
import { getAll[CollectionName], get[CollectionName]ByIds } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'

export default defineEventHandler(async (event) => {
  const { id: teamId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized Access',
    })
  }

  const query = getQuery(event)
  const ids = query.ids
  if (ids) {
    const itemIds = Array.isArray(ids)
      ? ids.map(String)
      : typeof ids === 'string'
        ? ids.split(',')
        : [String(ids)]
    return await get[CollectionName]ByIds(teamId, itemIds)
  }

  return await getAll[CollectionName](teamId)
})
```

### `server/api/teams/[id]/[collection-name]/index.post.ts`
```typescript
import { create[CollectionName] } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'

export default defineEventHandler(async (event) => {
  const { id: teamId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized Access',
    })
  }
  
  const body = await readBody(event)
  const payload = {
    ...body,
    teamId,
    userId: user.id,
  }
  
  const item = await create[CollectionName](payload)
  return item
})
```

## 8. Create nuxt.config.ts
```typescript
import { basename } from 'path'

const layerName = basename(__dirname)

export default defineNuxtConfig({
  components: {
    dirs: [
      {
        path: './app/components',
        prefix: layerName,
        global: true
      }
    ]
  }
})
```

## That's it! 
The collection will be automatically discovered and registered. Both client-side components and server-side API endpoints are included. No manual registration needed.

## Naming Convention Summary
- Folder: `layers/collections/tasks/`
- Config name: `tasksConfig` with `name: 'tasks'`
- Component prefix: `Tasks` (becomes `TasksForm`, `TasksList`)
- Type names: `Task`, `TaskFormData`, `TaskFormProps`
- Composable: `useTasks()`
- API endpoints: `/api/teams/[id]/tasks/*`
- Query functions: `getAllTasks`, `createTask`, `updateTask`, `deleteTask`

## Server-Side Benefits
- API endpoints are co-located with the collection
- Can use generic base queries or write custom ones
- Automatic authorization checks
- Consistent error handling
- Type-safe from database to API