#!/usr/bin/env node

import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import { promisify } from 'util'
import readline from 'readline'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Tracking for rollback
let createdFiles = []
let createdDirectories = []
let originalNuxtConfig = null
let originalRootNuxtConfig = null
let originalSchemaIndex = null
let collectionName = null
let globalConfig = null
let targetLayer = null

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
}

// Helper function to create readline interface
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
}

// Helper function to prompt user
function prompt(question) {
  const rl = createInterface()
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close()
      resolve(answer)
    })
  })
}

// Helper function to convert string to different cases
function toCase(str) {
  const singular = str.endsWith('s') && str.length > 1 ? str.slice(0, -1) : str
  const plural = str.endsWith('s') ? str : str + 's'

  return {
    singular: singular.toLowerCase(),
    plural: plural.toLowerCase(),
    pascalCase: singular.charAt(0).toUpperCase() + singular.slice(1),
    pascalCasePlural: plural.charAt(0).toUpperCase() + plural.slice(1),
    camelCase: singular.charAt(0).toLowerCase() + singular.slice(1),
    camelCasePlural: plural.charAt(0).toLowerCase() + plural.slice(1),
    upperCase: singular.toUpperCase(),
    kebabCase: singular.toLowerCase().replace(/[A-Z]/g, '-$&').toLowerCase()
  }
}

// Map form field types to database types
const typeMapping = {
  string: {
    db: 'VARCHAR(255)',
    drizzle: 'text',
    zod: 'z.string()',
    default: "''",
    tsType: 'string'
  },
  text: {
    db: 'TEXT',
    drizzle: 'text',
    zod: 'z.string()',
    default: "''",
    tsType: 'string'
  },
  number: {
    db: 'INTEGER',
    drizzle: 'integer',
    zod: 'z.number()',
    default: '0',
    tsType: 'number'
  },
  decimal: {
    db: 'DECIMAL(10,2)',
    drizzle: 'decimal',
    zod: 'z.number()',
    default: '0',
    tsType: 'number'
  },
  boolean: {
    db: 'BOOLEAN',
    drizzle: 'boolean',
    zod: 'z.boolean()',
    default: 'false',
    tsType: 'boolean'
  },
  date: {
    db: 'DATE',
    drizzle: 'date',
    zod: 'z.string()',
    default: "''",
    tsType: 'string'
  },
  json: {
    db: 'JSONB',
    drizzle: 'jsonb',
    zod: 'z.object({})',
    default: '{}',
    tsType: 'Record<string, any>'
  }
}

// Parse field collections from command line
function parseFields(fieldsStr) {
  if (!fieldsStr) return []

  return fieldsStr.split(',').map(fieldStr => {
    const parts = fieldStr.split(':')
    const name = parts[0]
    const type = parts[1] || 'string'
    const required = parts[2] === 'required'

    return {
      name,
      type,
      required,
      ...typeMapping[type]
    }
  })
}

// Read and process template file
async function processTemplate(templatePath, data) {
  const template = await fs.readFile(templatePath, 'utf-8')

  // Simple template replacement
  let result = template

  // Replace all {{variable}} patterns
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, data[key])
  })

  // Process loops {{#each fields}}...{{/each}}
  const loopRegex = /{{#each fields}}([\s\S]*?){{\/each}}/g
  result = result.replace(loopRegex, (match, content) => {
    return data.fields.map(field => {
      let fieldContent = content
      Object.keys(field).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        fieldContent = fieldContent.replace(regex, field[key])
      })
      return fieldContent.trim()
    }).join('\n  ')
  })

  return result
}

// Rollback function to clean up on error
async function rollback() {
  console.log(`\n${colors.yellow}⚠ Rolling back changes...${colors.reset}`)

  try {
    // Delete created files
    for (const file of createdFiles) {
      try {
        await fs.unlink(file)
        console.log(`${colors.yellow}  ✓${colors.reset} Removed ${path.basename(file)}`)
      } catch (err) {
        // File might not exist, that's ok
      }
    }

    // Delete created directories (in reverse order to delete nested dirs first)
    for (const dir of createdDirectories.reverse()) {
      try {
        // Only remove if directory is empty
        await fs.rmdir(dir)
        console.log(`${colors.yellow}  ✓${colors.reset} Removed directory ${path.basename(dir)}`)
      } catch (err) {
        // Directory might not be empty or not exist, that's ok
      }
    }

    // Try to remove the main collection directory if it's empty
    if (collectionName && targetLayer) {
      const cases = toCase(collectionName)
      const collectionDir = path.join(process.cwd(), 'layers', targetLayer, 'collections', cases.plural)
      try {
        await removeDirectoryRecursive(collectionDir)
        console.log(`${colors.yellow}  ✓${colors.reset} Removed collection directory`)
      } catch (err) {
        // Directory might not exist or not be empty, that's ok
      }
    }

    // Restore original nuxt.config.ts if we modified it
    if (originalNuxtConfig && targetLayer) {
      const configPath = path.join(process.cwd(), 'layers', targetLayer, 'nuxt.config.ts')
      await fs.writeFile(configPath, originalNuxtConfig)
      console.log(`${colors.yellow}  ✓${colors.reset} Restored ${targetLayer} nuxt.config.ts`)
    }

    // Restore original root nuxt.config.ts if we modified it
    if (originalRootNuxtConfig) {
      const rootConfigPath = path.join(process.cwd(), 'nuxt.config.ts')
      await fs.writeFile(rootConfigPath, originalRootNuxtConfig)
      console.log(`${colors.yellow}  ✓${colors.reset} Restored root nuxt.config.ts`)
    }

    // Restore original schema index if we modified it
    if (originalSchemaIndex) {
      const schemaIndexPath = path.join(process.cwd(), 'server', 'database', 'schema', 'index.ts')
      await fs.writeFile(schemaIndexPath, originalSchemaIndex)
      console.log(`${colors.yellow}  ✓${colors.reset} Restored schema index`)
    }

    console.log(`${colors.green}✓${colors.reset} Rollback completed\n`)
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Error during rollback:`, error.message)
  }
}

// Helper function to recursively remove a directory
async function removeDirectoryRecursive(dir) {
  try {
    const files = await fs.readdir(dir)

    for (const file of files) {
      const filePath = path.join(dir, file)
      const stat = await fs.stat(filePath)

      if (stat.isDirectory()) {
        await removeDirectoryRecursive(filePath)
      } else {
        await fs.unlink(filePath)
      }
    }

    await fs.rmdir(dir)
  } catch (error) {
    // Directory doesn't exist or can't be removed
    throw error
  }
}

// Generate all files for a collection
async function generateFiles(config) {
  const { name, fields, layer } = config
  const cases = toCase(name)

  const data = {
    ...cases,
    fields,
    fieldsSchema: fields.map(f =>
      `${f.name}: ${f.zod}${f.required ? `.min(1, '${f.name} is required')` : '.optional()'}`
    ).join(',\n  '),
    fieldsDefault: fields.map(f => `${f.name}: ${f.default}`).join(',\n    '),
    fieldsColumns: fields.map(f => `{ accessorKey: '${f.name}', header: '${f.name.charAt(0).toUpperCase() + f.name.slice(1)}' }`).join(',\n  ').concat(',\n  { accessorKey: \'actions\', header: \'Actions\' }'),
    fieldsTypes: fields.map(f => `${f.name}${f.required ? '' : '?'}: ${f.tsType}`).join('\n  ')
  }

  const collectionDir = path.join(process.cwd(), 'layers', layer, 'collections', cases.plural)

  // Store collection name for rollback
  collectionName = name

  // Create directory structure and track them
  const dirs = [
    path.join(collectionDir, 'app', 'components'),
    path.join(collectionDir, 'app', 'composables'),
    path.join(collectionDir, 'server', 'api', 'teams', '[id]', cases.plural),
    path.join(collectionDir, 'server', 'database')
  ]

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true })
    createdDirectories.push(dir)
  }

  console.log(`${colors.green}✓${colors.reset} Created directory structure`)

  // Generate files from templates
  const templates = [
    { from: 'components/Form.vue.hbs', to: `app/components/Form.vue` },
    { from: 'components/List.vue.hbs', to: `app/components/List.vue` },
    { from: 'composables/useCollection.ts.hbs', to: `app/composables/use${cases.pascalCasePlural}.ts` },
    { from: 'api/index.get.ts.hbs', to: `server/api/teams/[id]/${cases.plural}/index.get.ts` },
    { from: 'api/index.post.ts.hbs', to: `server/api/teams/[id]/${cases.plural}/index.post.ts` },
    { from: 'api/[id].patch.ts.hbs', to: `server/api/teams/[id]/${cases.plural}/[${cases.singular}Id].patch.ts` },
    { from: 'api/[id].delete.ts.hbs', to: `server/api/teams/[id]/${cases.plural}/[${cases.singular}Id].delete.ts` },
    { from: 'database/queries.ts.hbs', to: 'server/database/queries.ts' },
    { from: 'database/schema.ts.hbs', to: 'server/database/schema.ts' },
    { from: 'types.ts.hbs', to: 'types.ts' },
    { from: 'nuxt.config.ts.hbs', to: 'nuxt.config.ts' }
  ]

  for (const template of templates) {
    const templatePath = path.join(__dirname, 'templates', template.from)
    const outputPath = path.join(collectionDir, template.to)

    // Check if template exists, if not create a basic one
    let content
    try {
      content = await processTemplate(templatePath, data)
    } catch (error) {
      // Template doesn't exist yet, we'll create basic content
      content = await generateBasicContent(template.from, data)
    }

    await fs.writeFile(outputPath, content)
    createdFiles.push(outputPath)
    console.log(`${colors.green}✓${colors.reset} Generated ${template.to}`)
  }
}

// Generate basic content when template doesn't exist
async function generateBasicContent(templateName, data) {
  const { singular, plural, pascalCase, pascalCasePlural } = data

  // Generate content based on template name
  if (templateName.includes('Form.vue')) {
    return generateFormComponent(data)
  } else if (templateName.includes('List.vue')) {
    return generateListComponent(data)
  } else if (templateName.includes('useCollection')) {
    return generateComposable(data)
  } else if (templateName.includes('index.get')) {
    return generateGetEndpoint(data)
  } else if (templateName.includes('index.post')) {
    return generatePostEndpoint(data)
  } else if (templateName.includes('[id].patch')) {
    return generatePatchEndpoint(data)
  } else if (templateName.includes('[id].delete')) {
    return generateDeleteEndpoint(data)
  } else if (templateName.includes('queries.ts')) {
    return generateQueries(data)
  } else if (templateName.includes('schema.ts')) {
    return generateSchema(data)
  } else if (templateName.includes('types.ts')) {
    return generateTypes(data)
  } else if (templateName.includes('nuxt.config')) {
    return generateNuxtConfig(data)
  }

  return ''
}

// Generate Form component
function generateFormComponent(data) {
  const { pascalCase, pascalCasePlural, fields } = data

  const formFields = fields.map(field => {
    const fieldName = field.name.charAt(0).toUpperCase() + field.name.slice(1)
    if (field.type === 'text') {
      return `      <UFormField label="${fieldName}" name="${field.name}">
        <UTextarea v-model="state.${field.name}" class="w-full" size="xl" />
      </UFormField>`
    } else if (field.type === 'boolean') {
      return `      <UFormField label="${fieldName}" name="${field.name}">
        <UCheckbox v-model="state.${field.name}" />
      </UFormField>`
    } else if (field.type === 'number' || field.type === 'decimal') {
      return `      <UFormField label="${fieldName}" name="${field.name}">
        <UInput v-model.number="state.${field.name}" type="number" class="w-full" size="xl" />
      </UFormField>`
    } else {
      return `      <UFormField label="${fieldName}" name="${field.name}">
        <UInput v-model="state.${field.name}" class="w-full" size="xl" />
      </UFormField>`
    }
  }).join('\n\n')

  // Generate initial state fields
  const stateFields = fields.map(field => {
    const defaultVal = field.type === 'boolean' ? 'false' :
                      field.type === 'number' || field.type === 'decimal' ? '0' : "''";
    return `  ${field.name}: ${defaultVal}`
  }).join(',\n')

  return `<template>
  <div v-if="loading === 'notLoading'">
    <!-- DELETE BUTTON-->
    <CrudButton
      v-if="action === 'delete'"
      :action="action"
      :collection="collection"
      :items="items"
      :loading="loading"
    />

    <!-- FORM FOR EDIT OR CREATE -->
    <UForm
      v-else
      :schema="schema"
      :state="state"
      class="space-y-4 flex flex-col justify-between h-full gap-4"
      @submit="send(action, collection, state)"
      size="lg"
    >
${formFields}

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
import type { ${pascalCase}FormProps, ${pascalCase}FormData } from '../../types'
import { z } from 'zod'

const { send } = useCrud()

const props = defineProps<${pascalCase}FormProps>()

const { defaultValue, schema } = use${pascalCasePlural}()

// Create a reactive form state with proper typing
const state = reactive<${pascalCase}FormData & { id?: string | null }>({
  id: null,
${stateFields}
})

// Compute what the initial values should be based on props
const getInitialValues = () => {
  if (props.action === 'update' && 'id' in props.activeItem && props.activeItem.id) {
    // Update mode: use activeItem data
    return {
      ...props.activeItem
    }
  } else if (props.action === 'create') {
    // Create mode: use defaults
    return {
      ...defaultValue
    }
  } else {
    // Fallback to empty object
    return {}
  }
}

// Initialize and watch for prop changes
watchEffect(() => {
  const initialValues = getInitialValues()
  // Merge the values into the reactive state
  Object.assign(state, initialValues)
})
</script>`
}

// Generate List component
function generateListComponent(data) {
  const { plural, pascalCasePlural } = data

  return `<template>
  <CrudTable
    collection="${plural}"
    :columns="columns"
    :rows="collection${pascalCasePlural}"
  >
    <template #header>
      <CrudTableHeader
        title="${pascalCasePlural}"
        :collection="'${plural}'"
        createButton
      />
    </template>
  </CrudTable>
</template>

<script setup lang="ts">
const { columns } = use${pascalCasePlural}()
const { currentTeam } = useTeam()
const { ${plural}: collection${pascalCasePlural} } = useCollections()

const { data: ${plural}, refresh } = await useFetch(
  \`/api/teams/\${currentTeam.value.id}/${plural}\`,
  {
    watch: [currentTeam],
  },
)

// Directly assign the fetched ${plural} to the collection
if (${plural}.value) {
  collection${pascalCasePlural}.value = ${plural}.value
}
</script>`
}

// Generate composable
function generateComposable(data) {
  const { singular, plural, pascalCase, pascalCasePlural } = data

  return `import { z } from 'zod'

export const ${singular}Schema = z.object({
  ${data.fieldsSchema}
})

export const ${plural}Columns = [
  ${data.fieldsColumns}
]

export const ${plural}Config = {
  name: '${plural}',
  apiPath: '${plural}',
  componentName: '${pascalCasePlural}Form',
  schema: ${singular}Schema,
  defaultValues: {
    ${data.fieldsDefault}
  },
  columns: ${plural}Columns,
}

export const use${pascalCasePlural} = () => ${plural}Config

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: ${plural}Config.defaultValues,
    schema: ${plural}Config.schema,
    columns: ${plural}Config.columns
  }
}`
}

// Generate GET endpoint
function generateGetEndpoint(data) {
  const { pascalCase, pascalCasePlural } = data

  return `import { getAll${pascalCasePlural}, get${pascalCasePlural}ByIds } from '../../../../database/queries'
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

  if (query.ids) {
    const ids = String(query.ids).split(',')
    return await get${pascalCasePlural}ByIds(teamId, ids)
  }

  return await getAll${pascalCasePlural}(teamId)
})`
}

// Generate POST endpoint
function generatePostEndpoint(data) {
  const { singular, pascalCase } = data

  return `import { create${pascalCase} } from '../../../../database/queries'
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

  // Exclude id field to let the database generate it
  const { id, ...dataWithoutId } = body

  return await create${pascalCase}({ ...dataWithoutId, teamId, userId: user.id })
})`
}

// Generate PATCH endpoint
function generatePatchEndpoint(data) {
  const { singular, pascalCase, fields } = data

  // Generate field selection for update
  const fieldSelection = fields.map(field => `    ${field.name}: body.${field.name}`).join(',\n')

  return `import { update${pascalCase} } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { ${pascalCase} } from '../../../../../../types'

export default defineEventHandler(async (event) => {
  const { id: teamId, ${singular}Id } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized Access',
    })
  }

  const body = await readBody<Partial<${pascalCase}>>(event)

  return await update${pascalCase}(${singular}Id, teamId, user.id, {
${fieldSelection}
  })
})`
}

// Generate DELETE endpoint
function generateDeleteEndpoint(data) {
  const { singular, pascalCase } = data

  return `import { delete${pascalCase} } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'

export default defineEventHandler(async (event) => {
  const { id: teamId, ${singular}Id } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized Access',
    })
  }

  return await delete${pascalCase}(${singular}Id, teamId, user.id)
})`
}

// Generate database queries
function generateQueries(data) {
  const { singular, plural, pascalCase, pascalCasePlural } = data

  return `import type { ${pascalCase}, New${pascalCase} } from '../types'

export async function getAll${pascalCasePlural}(teamId: string) {
  const db = useDB()

  const ${plural} = await db
    .select()
    .from(tables.${plural})
    .where(eq(tables.${plural}.teamId, teamId))
    .orderBy(desc(tables.${plural}.createdAt))

  return ${plural}
}

export async function get${pascalCasePlural}ByIds(teamId: string, ids: string[]) {
  const db = useDB()

  const ${plural} = await db
    .select()
    .from(tables.${plural})
    .where(
      and(
        eq(tables.${plural}.teamId, teamId),
        inArray(tables.${plural}.id, ids)
      )
    )

  return ${plural}
}

export async function create${pascalCase}(data: New${pascalCase}) {
  const db = useDB()

  const [${singular}] = await db
    .insert(tables.${plural})
    .values(data)
    .returning()

  return ${singular}
}

export async function update${pascalCase}(${singular}Id: string, teamId: string, userId: string, updates: Partial<${pascalCase}>) {
  const db = useDB()

  const [${singular}] = await db
    .update(tables.${plural})
    .set(updates)
    .where(
      and(
        eq(tables.${plural}.id, ${singular}Id),
        eq(tables.${plural}.teamId, teamId),
        eq(tables.${plural}.userId, userId)
      )
    )
    .returning()

  if (!${singular}) {
    throw createError({
      statusCode: 404,
      statusMessage: '${pascalCase} not found or unauthorized'
    })
  }

  return ${singular}
}

export async function delete${pascalCase}(${singular}Id: string, teamId: string, userId: string) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.${plural})
    .where(
      and(
        eq(tables.${plural}.id, ${singular}Id),
        eq(tables.${plural}.teamId, teamId),
        eq(tables.${plural}.userId, userId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: '${pascalCase} not found or unauthorized'
    })
  }

  return { success: true }
}`
}

// Generate Drizzle schema
function generateSchema(data) {
  const { plural } = data
  const schemaFields = data.fields.map(field => {
    const nullable = field.required ? '.notNull()' : ''

    if (field.type === 'boolean') {
      return `  ${field.name}: integer('${field.name}', { mode: 'boolean' })${nullable}.$default(() => false)`
    } else if (field.type === 'number' || field.type === 'decimal') {
      return `  ${field.name}: integer('${field.name}')${nullable}`
    } else {
      return `  ${field.name}: text('${field.name}')${nullable}`
    }
  }).join(',\n')

  return `import { nanoid } from 'nanoid'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const ${plural} = sqliteTable('${plural}', {
  id: text('id').primaryKey().$default(() => nanoid()),
  teamId: text('team_id').notNull(),
  userId: text('user_id').notNull(),
${schemaFields},
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$onUpdate(() => new Date())
})`
}

// Generate TypeScript types
function generateTypes(data) {
  const { pascalCase } = data

  return `import type { z } from 'zod'
import type { ${data.singular}Schema } from './app/composables/use${data.pascalCasePlural}'

export interface ${pascalCase} {
  id: string
  teamId: string
  userId: string
  ${data.fieldsTypes}
  createdAt: Date
  updatedAt: Date
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type ${pascalCase}FormData = z.infer<typeof ${data.singular}Schema>
export type New${pascalCase} = Omit<${pascalCase}, 'id' | 'createdAt' | 'updatedAt'>

// Props type for the Form component
export interface ${pascalCase}FormProps {
  items: string[] // Array of IDs for delete action
  activeItem: ${pascalCase} | Record<string, never> // ${pascalCase} for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}`
}

// Generate nuxt.config.ts for the layer
function generateNuxtConfig(data) {
  const { pascalCasePlural } = data

  return `import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const currentDir = fileURLToPath(new URL('.', import.meta.url))

export default defineNuxtConfig({
  components: {
    dirs: [
      {
        path: join(currentDir, 'app/components'),
        prefix: '${pascalCasePlural}',
        global: true // Makes them available globally
      }
    ]
  }
})`
}

// Update the main schema index to export the new collection schema
async function updateSchemaIndex(collectionName, layer) {
  const cases = toCase(collectionName)
  const schemaIndexPath = path.join(process.cwd(), 'server', 'database', 'schema', 'index.ts')

  try {
    let content = await fs.readFile(schemaIndexPath, 'utf-8')

    // Store original content for rollback
    if (!originalSchemaIndex) {
      originalSchemaIndex = content
    }

    // Add export for the new collection schema (using relative path)
    const exportLine = `export * from '../../../layers/${layer}/collections/${cases.plural}/server/database/schema'`

    // Check if already exists
    if (!content.includes(exportLine)) {
      // Add the new export at the end of the file
      content = content.trim() + '\n' + exportLine + '\n'

      await fs.writeFile(schemaIndexPath, content)
      console.log(`${colors.green}✓${colors.reset} Updated schema index with ${cases.plural} export`)
      return true
    }
    return true
  } catch (error) {
    console.error(`${colors.yellow}!${colors.reset} Could not update schema index:`, error.message)
    return false
  }
}

// Create database table using Drizzle
async function createDatabaseTable(config) {
  const { name, fields, layer } = config
  const cases = toCase(name)

  try {
    // Verify the schema file exists
    const schemaPath = path.join(process.cwd(), 'layers', layer, 'collections', cases.plural, 'server', 'database', 'schema.ts')

    try {
      await fs.access(schemaPath)
    } catch {
      console.error(`${colors.red}✗${colors.reset} Schema file not found at ${schemaPath}`)
      return false
    }

    // First, update the schema index to include the new collection
    console.log(`${colors.yellow}↻${colors.reset} Updating schema index...`)
    const schemaUpdated = await updateSchemaIndex(name, layer)

    if (!schemaUpdated) {
      console.log(`${colors.yellow}!${colors.reset} Schema index not updated, but continuing...`)
    }

    // Run db:generate to sync with database
    console.log(`${colors.yellow}↻${colors.reset} Creating database migration...`)
    console.log(`${colors.yellow}!${colors.reset} Running: pnpm db:generate`)

    try {
      const { stdout, stderr } = await execAsync('pnpm db:generate')
      if (stderr && !stderr.includes('Warning')) {
        console.error(`${colors.yellow}!${colors.reset} Drizzle warnings:`, stderr)
      }
      console.log(`${colors.green}✓${colors.reset} Database migration generated`)

      // Note: The migration has been generated but needs to be applied
      console.log(`${colors.yellow}!${colors.reset} Migration generated. The table will be created when you restart the dev server.`)

      return true
    } catch (execError) {
      console.error(`${colors.red}✗${colors.reset} Failed to run database migration:`, execError.message)
      console.log(`${colors.yellow}!${colors.reset} You can manually run: pnpm db:generate && pnpm db:push`)
      return false
    }
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Failed to create database table:`, error.message)
    console.log(`${colors.yellow}!${colors.reset} You may need to create the table manually with: pnpm db:generate && pnpm db:push`)
    return false
  }
}

// Update or create layer nuxt.config.ts
async function updateNuxtConfig(collectionName, layer) {
  const cases = toCase(collectionName)
  const configPath = path.join(process.cwd(), 'layers', layer, 'nuxt.config.ts')
  const layerDir = path.join(process.cwd(), 'layers', layer)

  try {
    // First ensure the layer directory exists
    await fs.mkdir(layerDir, { recursive: true })
    
    let config
    let configExists = false
    
    try {
      config = await fs.readFile(configPath, 'utf-8')
      configExists = true
      
      // Store original config for rollback
      if (!originalNuxtConfig) {
        originalNuxtConfig = config
      }
    } catch (readError) {
      // File doesn't exist, create a new one
      console.log(`${colors.yellow}↻${colors.reset} Creating ${layer} layer nuxt.config.ts`)
      config = `import { basename } from 'path'

const layerName = basename(__dirname)

export default defineNuxtConfig({
  components: {
    dirs: [
      {
        path: './components',
        prefix: layerName,
        global: true // Makes them available globally
      }
    ]
  },
  extends: [
  ]
})
`
    }

    // Find the extends array
    const extendsMatch = config.match(/extends:\s*\[([\s\S]*?)\]/m)
    if (extendsMatch) {
      const currentExtends = extendsMatch[1]
      const newLayer = `'./collections/${cases.plural}'`

      // Check if already exists
      if (!currentExtends.includes(newLayer)) {
        // Add the new layer after the last entry
        const lines = currentExtends.split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/,+\s*$/, '')) // Remove trailing commas
        
        lines.push(newLayer)
        
        // Add proper indentation and commas
        const formattedLines = lines.map((line, index) => {
          const trimmedLine = line.trim().replace(/^['"]|['"]$/g, '') // Remove quotes temporarily
          const formattedLine = `    './${trimmedLine.replace(/^\.\//, '')}'`
          return index < lines.length - 1 ? formattedLine + ',' : formattedLine
        })
        
        const updatedExtends = formattedLines.join('\n')

        config = config.replace(extendsMatch[0], `extends: [\n${updatedExtends}\n  ]`)

        await fs.writeFile(configPath, config)
        
        if (!configExists) {
          createdFiles.push(configPath) // Track for rollback
        }
        
        console.log(`${colors.green}✓${colors.reset} ${configExists ? 'Updated' : 'Created'} ${layer} layer nuxt.config.ts`)
      }
    }
  } catch (error) {
    console.error(`${colors.yellow}!${colors.reset} Could not update ${layer} nuxt.config.ts automatically`)
    console.log(`  Please add './collections/${cases.plural}' to the extends array in layers/${layer}/nuxt.config.ts manually`)
  }
}

// Update root nuxt.config.ts to extend the layer
async function updateRootNuxtConfig(layer) {
  const rootConfigPath = path.join(process.cwd(), 'nuxt.config.ts')
  
  try {
    let config = await fs.readFile(rootConfigPath, 'utf-8')
    
    // Store original config for rollback
    if (!originalRootNuxtConfig) {
      originalRootNuxtConfig = config
    }
    
    // Find the extends array
    const extendsMatch = config.match(/extends:\s*\[([\s\S]*?)\]/m)
    if (extendsMatch) {
      const currentExtends = extendsMatch[1]
      const layerPath = `'./layers/${layer}'`
      
      // Check if layer is already in extends
      if (!currentExtends.includes(layerPath)) {
        // Add the new layer after the last entry
        const lines = currentExtends.split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/,?\s*$/, '')) // Remove trailing commas
        
        lines.push(layerPath)
        
        // Add proper indentation and commas
        const formattedLines = lines.map((line, index) => {
          const trimmedLine = line.trim()
          const indentedLine = `    ${trimmedLine}`
          return index < lines.length - 1 ? indentedLine + ',' : indentedLine
        })
        
        const updatedExtends = formattedLines.join('\n')
        
        config = config.replace(extendsMatch[0], `extends: [\n${updatedExtends}\n  ]`)
        
        await fs.writeFile(rootConfigPath, config)
        console.log(`${colors.green}✓${colors.reset} Updated root nuxt.config.ts to extend ${layer} layer`)
      }
    }
  } catch (error) {
    console.error(`${colors.yellow}!${colors.reset} Could not update root nuxt.config.ts automatically`)
    console.log(`  Please add './layers/${layer}' to the extends array in nuxt.config.ts manually`)
  }
}

// Interactive mode to gather field information
async function interactiveMode() {
  console.log(`\n${colors.bright}Collection Generator - Interactive Mode${colors.reset}\n`)

  const layer = await prompt('Target layer name (required, e.g., test, collections): ')
  if (!layer) {
    console.error(`${colors.red}Target layer is required${colors.reset}`)
    process.exit(1)
  }

  const name = await prompt('Collection name (plural, e.g., products): ')
  if (!name) {
    console.error(`${colors.red}Collection name is required${colors.reset}`)
    process.exit(1)
  }

  const fields = []
  let addMore = true

  console.log('\nDefine fields for your collection (press Enter to use defaults):')

  while (addMore) {
    console.log('')
    const fieldName = await prompt('Field name (or press Enter to finish): ')

    if (!fieldName) {
      addMore = false
      continue
    }

    const fieldType = await prompt(`Field type (string/text/number/decimal/boolean/date) [string]: `) || 'string'
    const fieldRequired = (await prompt('Required field? (y/n) [n]: ')).toLowerCase() === 'y'

    fields.push({
      name: fieldName,
      type: fieldType,
      required: fieldRequired,
      ...typeMapping[fieldType]
    })
  }

  // Add default fields if none provided
  if (fields.length === 0) {
    fields.push(
      { name: 'name', type: 'string', required: true, ...typeMapping.string },
      { name: 'description', type: 'text', required: false, ...typeMapping.text }
    )
    console.log('\nUsing default fields: name (string), description (text)')
  }

  const createTable = (await prompt('\nCreate database table? (y/n) [y]: ')).toLowerCase() !== 'n'

  return { name, fields, createTable, layer }
}

// Main function
async function main() {
  // Reset tracking for each run
  createdFiles = []
  createdDirectories = []
  originalNuxtConfig = null
  originalSchemaIndex = null
  collectionName = null

  const args = process.argv.slice(2)

  let config = {}

  if (args.length === 0 || args.includes('--interactive') || args.includes('-i')) {
    // Interactive mode
    config = await interactiveMode()
  } else {
    // Parse command line arguments
    const name = args[0]
    const layerArg = args.find(arg => arg.startsWith('--layer='))
    
    if (!layerArg) {
      console.error(`${colors.red}✗ Error: Target layer is required${colors.reset}`)
      console.log(`\nUsage: pnpm generate:collection <name> --layer=<layer_name> [options]`)
      console.log(`\nExample:`)
      console.log(`  pnpm generate:collection products --layer=test`)
      console.log(`  pnpm generate:collection products --layer=collections --fields=name:string:required,price:number`)
      console.log(`\nOptions:`)
      console.log(`  --layer=<name>     Target layer directory (required)`)
      console.log(`  --fields=<fields>  Comma-separated field definitions`)
      console.log(`  --no-db            Skip database table creation`)
      console.log(`  --interactive, -i  Interactive mode\n`)
      process.exit(1)
    }
    
    const layer = layerArg.split('=')[1]
    if (!layer) {
      console.error(`${colors.red}✗ Error: Layer name cannot be empty${colors.reset}`)
      process.exit(1)
    }
    
    const fieldsArg = args.find(arg => arg.startsWith('--fields='))
    const fields = fieldsArg ? parseFields(fieldsArg.split('=')[1]) : [
      { name: 'name', type: 'string', required: true, ...typeMapping.string },
      { name: 'description', type: 'text', required: false, ...typeMapping.text }
    ]

    config = {
      name,
      fields,
      createTable: !args.includes('--no-db'),
      layer
    }
  }

  console.log(`\n${colors.bright}Creating collection: ${config.name} in layer: ${config.layer}${colors.reset}\n`)

  // Store config globally for rollback
  globalConfig = config
  targetLayer = config.layer

  try {
    // Generate all files
    await generateFiles(config)

    // Update layer's nuxt.config.ts
    await updateNuxtConfig(config.name, config.layer)
    
    // Update root nuxt.config.ts to extend the layer
    await updateRootNuxtConfig(config.layer)

    // Create database table if requested
    if (config.createTable) {
      await createDatabaseTable(config)
    }

    const cases = toCase(config.name)

    console.log(`\n${colors.green}${colors.bright}✨ Collection '${cases.plural}' generated successfully!${colors.reset}`)
    console.log(`\n${colors.blue}📁 Location:${colors.reset} layers/${config.layer}/collections/${cases.plural}/`)
    console.log(`\n${colors.yellow}🎯 Next steps:${colors.reset}`)
    console.log(`  1. Review the schema in use${cases.pascalCasePlural}.ts`)
    console.log(`  2. Customize the form fields if needed`)
    console.log(`  3. Restart your dev server: ${colors.bright}pnpm dev${colors.reset}`)
    console.log(`  4. Your collection is ready to use!\n`)
  } catch (error) {
    console.error(`\n${colors.red}✗ Error during generation:${colors.reset}`, error.message)

    // Perform rollback
    await rollback()

    console.error(`\n${colors.red}Generation failed and has been rolled back.${colors.reset}`)
    console.log(`${colors.yellow}Please fix the issue and try again.${colors.reset}\n`)

    // Provide helpful error-specific guidance
    if (error.message.includes('drizzle')) {
      console.log(`${colors.blue}Hint:${colors.reset} Try running with --no-db flag to skip database creation`)
      console.log(`      pnpm generate:collection ${config.name} --no-db\n`)
    }

    process.exit(1)
  }
}

// Run the generator
main().catch(async error => {
  console.error(`${colors.red}Fatal Error:${colors.reset}`, error.message)

  // Try to rollback even on fatal errors
  if (createdFiles.length > 0 || createdDirectories.length > 0 || originalNuxtConfig) {
    await rollback()
  }

  process.exit(1)
})
