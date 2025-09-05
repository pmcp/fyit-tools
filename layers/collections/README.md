# Creating a New Collection

## What is a Collection?

A collection is a self-contained feature module that defines how a specific data type (like posts, tasks, users, products) should look and behave in your application. Think of it like a blueprint that works together with the CRUD layer to provide full Create, Read, Update, Delete functionality.

**Important**: Collections work in partnership with the CRUD layer:
- **The Collection provides**: Form components, list views, validation schemas, API endpoints, and database queries specific to your data type
- **The CRUD layer provides**: The generic flow orchestration, modal containers, optimistic updates, state management, and reusable UI components

Each collection includes:
- **Client-side**: Vue components for forms and lists, composables for configuration
- **Server-side**: API endpoints and database queries
- **Type definitions**: TypeScript interfaces for type safety
- **Auto-registration**: Drop it in and it works - but requires the CRUD layer to be installed!

## How Collections Work

1. **Auto-discovery**: The system automatically finds your collection when you add it to the `layers/collections/` folder
2. **Component naming**: Your components get prefixed automatically (e.g., `PostsForm`, `TasksList`)
3. **API routes**: Server endpoints are created at `/api/teams/[teamId]/[collection-name]/`
4. **CRUD Integration**: The CRUD layer provides the generic operations - your collection just defines the specifics
5. **Customizable**: Override any part with your own implementation

## Prerequisites

Before creating a collection, ensure you have:
- ✅ The CRUD layer installed and configured (`layers/crud`)
- ✅ The collections layer added to your `nuxt.config.ts`
- ✅ A database table matching your collection name
- ✅ User authentication and team management set up

## Quick Start

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

import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const currentDir = fileURLToPath(new URL('.', import.meta.url))

export default defineNuxtConfig({
  components: {
    dirs: [
      {
        path: join(currentDir, 'app/components'),
        prefix: '[CollectionName]', // e.g., 'Posts', 'Tasks'
        global: true
      }
    ]
  }
})
```

## That's it! 

Your collection is now ready to use:

1. **Add to nuxt.config.ts**: Add `'./layers/collections/[collection-name]'` to the extends array
2. **Restart your dev server** to pick up the new layer
3. **Use your components** anywhere: `<[CollectionName]List />` and `<[CollectionName]Form />`
4. **CRUD operations work** through the `useCrud()` composable
5. **API endpoints work** at `/api/teams/[teamId]/[collection-name]/`

The collection works with the CRUD layer to provide:
- Modal containers for your forms (`CrudContainer`)
- Table wrapper with selection (`CrudTable`)
- Optimistic updates via `useCrud().send()`
- Loading states and error handling
- Success/error toast notifications

## Common Use Cases

- **Blog System**: Create a `posts` collection for blog posts
- **Task Manager**: Create a `tasks` collection for todo items  
- **E-commerce**: Create `products`, `orders`, `categories` collections
- **CRM**: Create `contacts`, `companies`, `deals` collections
- **Any CRUD data**: If you need to Create, Read, Update, Delete it - make it a collection!

## Naming Convention Summary

**IMPORTANT**: Consistency in naming is crucial for auto-discovery to work!

### Example for a "tasks" collection:
- Folder: `layers/collections/tasks/`
- Config name: `tasksConfig` with `name: 'tasks'`
- Component prefix: `Tasks` (becomes `TasksForm`, `TasksList`)
- Type names: `Task`, `TaskFormData`, `TaskFormProps`
- Composable: `useTasks()`
- API endpoints: `/api/teams/[id]/tasks/*`
- Query functions: `getAllTasks`, `createTask`, `updateTask`, `deleteTask`

## Benefits of This Architecture

### For Development
- **Modular**: Each feature is self-contained in one folder
- **Reusable**: Copy a collection to another project, it just works
- **Maintainable**: Easy to find all code related to a feature
- **Type-safe**: Full TypeScript support from database to UI

### For Your App
- **Consistent UI**: All CRUD operations look and feel the same
- **Optimistic updates**: Instant UI feedback, rollback on errors
- **Authorization built-in**: Team-based access control included
- **Error handling**: Consistent error messages and recovery

### For Teams  
- **Parallel development**: Multiple developers can work on different collections
- **Clear ownership**: One developer can own an entire feature
- **Easy onboarding**: New developers just copy an existing collection
- **Standardized patterns**: Everyone follows the same structure

## Troubleshooting

**Components not found?**
- Make sure the prefix in `nuxt.config.ts` matches your folder name (capitalized)
- Restart the dev server after adding a new collection
- Check that your collection is added to the main `nuxt.config.ts` extends array

**API endpoints not working?**
- Ensure your database table exists with the same name as your collection
- Check that the team middleware is working (user must be team member)
- Verify the API path matches: `/api/teams/[teamId]/[collection-name]/`

**Types not working?**
- Import types from the collection's `types.ts` file
- Use `z.infer` to derive types from Zod schemas
- Ensure paths in imports use `../../types` from components