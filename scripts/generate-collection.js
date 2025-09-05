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
let collectionName = null
let globalConfig = null

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

// Parse field definitions from command line
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
    if (collectionName) {
      const cases = toCase(collectionName)
      // Always use definitions folder
      const collectionDir = path.join(process.cwd(), 'layers', 'collections', 'definitions', cases.plural)
      try {
        await removeDirectoryRecursive(collectionDir)
        console.log(`${colors.yellow}  ✓${colors.reset} Removed collection directory`)
      } catch (err) {
        // Directory might not exist or not be empty, that's ok
      }
    }
    
    // Restore original collections nuxt.config.ts if we modified it
    if (originalNuxtConfig) {
      const configPath = path.join(process.cwd(), 'layers', 'collections', 'nuxt.config.ts')
      await fs.writeFile(configPath, originalNuxtConfig)
      console.log(`${colors.yellow}  ✓${colors.reset} Restored collections nuxt.config.ts`)
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
  const { name, fields } = config
  const cases = toCase(name)
  
  const data = {
    ...cases,
    fields,
    fieldsSchema: fields.map(f => 
      `${f.name}: ${f.zod}${f.required ? `.min(1, '${f.name} is required')` : '.optional()'}`
    ).join(',\n  '),
    fieldsDefault: fields.map(f => `${f.name}: ${f.default}`).join(',\n    '),
    fieldsColumns: fields.map(f => `{ key: '${f.name}', label: '${f.name.charAt(0).toUpperCase() + f.name.slice(1)}' }`).join(',\n  '),
    fieldsTypes: fields.map(f => `${f.name}${f.required ? '' : '?'}: ${f.tsType}`).join('\n  ')
  }
  
  // Always use definitions folder
  const collectionDir = path.join(process.cwd(), 'layers', 'collections', 'definitions', cases.plural)
  
  // Store collection name for rollback
  collectionName = name
  
  // Create directory structure and track them
  const dirs = [
    path.join(collectionDir, 'app', 'components'),
    path.join(collectionDir, 'app', 'composables'),
    path.join(collectionDir, 'server', 'api', 'teams', '[teamId]', cases.plural),
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
    { from: 'api/index.get.ts.hbs', to: `server/api/teams/[teamId]/${cases.plural}/index.get.ts` },
    { from: 'api/index.post.ts.hbs', to: `server/api/teams/[teamId]/${cases.plural}/index.post.ts` },
    { from: 'api/[id].patch.ts.hbs', to: `server/api/teams/[teamId]/${cases.plural}/[${cases.singular}Id].patch.ts` },
    { from: 'api/[id].delete.ts.hbs', to: `server/api/teams/[teamId]/${cases.plural}/[${cases.singular}Id].delete.ts` },
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
    if (field.type === 'text') {
      return `      <UFormField name="${field.name}" label="${field.name}"${field.required ? ' required' : ''}>
        <UTextarea v-model="form.${field.name}" rows="4" />
      </UFormField>`
    } else if (field.type === 'boolean') {
      return `      <UFormField name="${field.name}" label="${field.name}">
        <UCheckbox v-model="form.${field.name}" />
      </UFormField>`
    } else if (field.type === 'number' || field.type === 'decimal') {
      return `      <UFormField name="${field.name}" label="${field.name}"${field.required ? ' required' : ''}>
        <UInput v-model.number="form.${field.name}" type="number" />
      </UFormField>`
    } else {
      return `      <UFormField name="${field.name}" label="${field.name}"${field.required ? ' required' : ''}>
        <UInput v-model="form.${field.name}" />
      </UFormField>`
    }
  }).join('\n\n')
  
  return `<template>
  <div class="space-y-4">
    <UForm :state="form" :schema="schema" @submit="handleSubmit">
${formFields}
      
      <div class="flex justify-between pt-4">
        <CrudButton
          v-if="action === 'update'"
          variant="destructive"
          :loading="loading === 'delete'"
          @click="handleDelete"
        >
          Delete
        </CrudButton>
        
        <CrudButton
          type="submit"
          variant="primary"
          :loading="loading === 'submit'"
        >
          {{ action === 'create' ? 'Create' : 'Update' }}
        </CrudButton>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { use${pascalCasePlural} } from '../composables/use${pascalCasePlural}'
import type { ${pascalCase}, ${pascalCase}FormData } from '../../types'

const crud = useCrud()
const config = use${pascalCasePlural}()

const props = defineProps<{
  action: 'create' | 'update'
  item?: ${pascalCase}
}>()

const form = ref<${pascalCase}FormData>(
  props.item ? { ...props.item } : { ...config.defaultValues }
)

const schema = config.schema
const loading = ref<'submit' | 'delete' | null>(null)

async function handleSubmit() {
  loading.value = 'submit'
  try {
    await crud.send(props.action, '${data.plural}', form.value, props.item?.id)
    crud.close()
  } catch (error) {
    console.error('Form submission error:', error)
  } finally {
    loading.value = null
  }
}

async function handleDelete() {
  if (!props.item?.id) return
  loading.value = 'delete'
  try {
    await crud.send('delete', '${data.plural}', {}, props.item.id)
    crud.close()
  } catch (error) {
    console.error('Delete error:', error)
  } finally {
    loading.value = null
  }
}
</script>`
}

// Generate List component
function generateListComponent(data) {
  const { plural, pascalCasePlural } = data
  
  return `<template>
  <div>
    <CrudTableHeader 
      :title="'${pascalCasePlural}'"
      @create="() => crud.open('create', '${plural}')"
    />
    
    <CrudTable
      :items="items"
      :columns="config.columns"
      :loading="pending"
      @edit="(item) => crud.open('update', '${plural}', item)"
      @delete="(item) => crud.send('delete', '${plural}', {}, item.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { use${pascalCasePlural} } from '../composables/use${pascalCasePlural}'

const crud = useCrud()
const config = use${pascalCasePlural}()
const team = useTeam()

const { data: items, pending, refresh } = await useFetch(\`/api/teams/\${team.value.id}/${plural}\`, {
  default: () => []
})

// Watch for CRUD operations to refresh
watch(() => crud.state.value.showCrud, (newVal) => {
  if (!newVal) refresh()
})
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
  componentName: '${pascalCase}Form',
  schema: ${singular}Schema,
  defaultValues: {
    ${data.fieldsDefault}
  },
  columns: ${plural}Columns,
}

export const use${pascalCasePlural} = () => ${plural}Config`
}

// Generate GET endpoint
function generateGetEndpoint(data) {
  const { pascalCase, pascalCasePlural } = data
  
  return `import { getAll${pascalCasePlural}, get${pascalCasePlural}ByIds } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'

export default defineEventHandler(async (event) => {
  const { teamId } = getRouterParams(event)
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
  const { teamId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized Access',
    })
  }
  
  const body = await readBody(event)
  
  return await create${pascalCase}({ ...body, teamId, userId: user.id })
})`
}

// Generate PATCH endpoint
function generatePatchEndpoint(data) {
  const { singular, pascalCase } = data
  
  return `import { update${pascalCase} } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'

export default defineEventHandler(async (event) => {
  const { teamId, ${singular}Id } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized Access',
    })
  }
  
  const body = await readBody(event)
  
  return await update${pascalCase}(${singular}Id, teamId, user.id, body)
})`
}

// Generate DELETE endpoint
function generateDeleteEndpoint(data) {
  const { singular, pascalCase } = data
  
  return `import { delete${pascalCase} } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'

export default defineEventHandler(async (event) => {
  const { teamId, ${singular}Id } = getRouterParams(event)
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
  
  return `import { eq, and, inArray, desc } from 'drizzle-orm'
import { ${plural}Table } from './schema'
import type { ${pascalCase}, New${pascalCase} } from '../types'

export async function getAll${pascalCasePlural}(teamId: string) {
  const db = useDB()
  
  const ${plural} = await db
    .select()
    .from(${plural}Table)
    .where(eq(${plural}Table.teamId, teamId))
    .orderBy(desc(${plural}Table.createdAt))
  
  return ${plural}
}

export async function get${pascalCasePlural}ByIds(teamId: string, ids: string[]) {
  const db = useDB()
  
  const ${plural} = await db
    .select()
    .from(${plural}Table)
    .where(
      and(
        eq(${plural}Table.teamId, teamId),
        inArray(${plural}Table.id, ids)
      )
    )
  
  return ${plural}
}

export async function create${pascalCase}(data: New${pascalCase}) {
  const db = useDB()
  
  const [${singular}] = await db
    .insert(${plural}Table)
    .values(data)
    .returning()
  
  return ${singular}
}

export async function update${pascalCase}(${singular}Id: string, teamId: string, userId: string, data: Partial<New${pascalCase}>) {
  const db = useDB()
  
  const [${singular}] = await db
    .update(${plural}Table)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(
      and(
        eq(${plural}Table.id, ${singular}Id),
        eq(${plural}Table.teamId, teamId),
        eq(${plural}Table.userId, userId)
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
    .delete(${plural}Table)
    .where(
      and(
        eq(${plural}Table.id, ${singular}Id),
        eq(${plural}Table.teamId, teamId),
        eq(${plural}Table.userId, userId)
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
    const drizzleType = typeMapping[field.type].drizzle
    const nullable = field.required ? '.notNull()' : ''
    
    if (field.type === 'boolean') {
      return `  ${field.name}: boolean('${field.name}')${nullable}.default(false)`
    } else if (field.type === 'number' || field.type === 'decimal') {
      return `  ${field.name}: integer('${field.name}')${nullable}`
    } else {
      return `  ${field.name}: text('${field.name}')${nullable}`
    }
  }).join(',\n')
  
  return `import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core'

export const ${plural}Table = pgTable('${plural}', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull(),
  userId: uuid('user_id').notNull(),
${schemaFields},
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
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
export type New${pascalCase} = Omit<${pascalCase}, 'id' | 'createdAt' | 'updatedAt'>`
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

// Create database table using Drizzle
async function createDatabaseTable(config) {
  const { name, fields } = config
  const cases = toCase(name)
  
  try {
    // Verify the schema file exists
    const schemaPath = path.join(process.cwd(), 'layers', 'collections', 'definitions', cases.plural, 'server', 'database', 'schema.ts')
    
    try {
      await fs.access(schemaPath)
    } catch {
      console.error(`${colors.red}✗${colors.reset} Schema file not found at ${schemaPath}`)
      return false
    }
    
    // Run db:generate to sync with database
    console.log(`${colors.yellow}↻${colors.reset} Creating database table...`)
    console.log(`${colors.yellow}!${colors.reset} Running: pnpm db:generate`)
    
    try {
      const { stdout, stderr } = await execAsync('pnpm db:generate')
      if (stderr && !stderr.includes('Warning')) {
        console.error(`${colors.yellow}!${colors.reset} Drizzle warnings:`, stderr)
      }
      console.log(`${colors.green}✓${colors.reset} Database migration completed`)
      return true
    } catch (execError) {
      console.error(`${colors.red}✗${colors.reset} Failed to run database migration:`, execError.message)
      console.log(`${colors.yellow}!${colors.reset} You can manually run: pnpm db:generate`)
      return false
    }
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Failed to create database table:`, error.message)
    console.log(`${colors.yellow}!${colors.reset} You may need to create the table manually with: pnpm db:generate`)
    return false
  }
}

// Update collections layer nuxt.config.ts
async function updateNuxtConfig(collectionName) {
  const cases = toCase(collectionName)
  const configPath = path.join(process.cwd(), 'layers', 'collections', 'nuxt.config.ts')
  
  try {
    let config = await fs.readFile(configPath, 'utf-8')
    
    // Store original config for rollback
    if (!originalNuxtConfig) {
      originalNuxtConfig = config
    }
    
    // Find the extends array
    const extendsMatch = config.match(/extends:\s*\[([\s\S]*?)\]/m)
    if (extendsMatch) {
      const currentExtends = extendsMatch[1]
      // Always use definitions folder
      const newLayer = `'./definitions/${cases.plural}'`
      
      // Check if already exists
      if (!currentExtends.includes(newLayer)) {
        // Add the new layer after the last entry
        const lines = currentExtends.split('\n').filter(line => line.trim())
        lines.push(`    ${newLayer}`)
        const updatedExtends = lines.join(',\n')
        
        config = config.replace(extendsMatch[0], `extends: [\n${updatedExtends}\n  ]`)
        
        await fs.writeFile(configPath, config)
        console.log(`${colors.green}✓${colors.reset} Updated collections layer nuxt.config.ts`)
      }
    }
  } catch (error) {
    console.error(`${colors.yellow}!${colors.reset} Could not update collections nuxt.config.ts automatically`)
    console.log(`  Please add './definitions/${cases.plural}' to the extends array in layers/collections/nuxt.config.ts manually`)
  }
}

// Interactive mode to gather field information
async function interactiveMode() {
  console.log(`\n${colors.bright}Collection Generator - Interactive Mode${colors.reset}\n`)
  
  const name = await prompt('Collection name (plural, e.g., products): ')
  if (!name) {
    console.error(`${colors.red}Collection name is required${colors.reset}`)
    process.exit(1)
  }
  
  // No longer asking for nested folder - always use definitions
  
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
  
  return { name, fields, createTable }
}

// Main function
async function main() {
  // Reset tracking for each run
  createdFiles = []
  createdDirectories = []
  originalNuxtConfig = null
  collectionName = null
  
  const args = process.argv.slice(2)
  
  let config = {}
  
  if (args.length === 0 || args.includes('--interactive') || args.includes('-i')) {
    // Interactive mode
    config = await interactiveMode()
  } else {
    // Parse command line arguments
    const name = args[0]
    const fieldsArg = args.find(arg => arg.startsWith('--fields='))
    const fields = fieldsArg ? parseFields(fieldsArg.split('=')[1]) : [
      { name: 'name', type: 'string', required: true, ...typeMapping.string },
      { name: 'description', type: 'text', required: false, ...typeMapping.text }
    ]
    
    config = {
      name,
      fields,
      createTable: !args.includes('--no-db')
    }
  }
  
  console.log(`\n${colors.bright}Creating collection: ${config.name}${colors.reset}\n`)
  
  // Store config globally for rollback
  globalConfig = config
  
  try {
    // Generate all files
    await generateFiles(config)
    
    // Update nuxt.config.ts
    await updateNuxtConfig(config.name)
    
    // Create database table if requested
    if (config.createTable) {
      await createDatabaseTable(config)
    }
    
    const cases = toCase(config.name)
    
    console.log(`\n${colors.green}${colors.bright}✨ Collection '${cases.plural}' generated successfully!${colors.reset}`)
    console.log(`\n${colors.blue}📁 Location:${colors.reset} layers/collections/definitions/${cases.plural}/`)
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