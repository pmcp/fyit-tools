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

// Check if collection exists
async function checkCollectionExists(name, layer) {
  const cases = toCase(name)
  const collectionDir = path.join(process.cwd(), 'layers', layer, 'collections', cases.plural)
  
  try {
    await fs.access(collectionDir)
    return true
  } catch {
    return false
  }
}

// Get list of available layers
async function getAvailableLayers() {
  const layersDir = path.join(process.cwd(), 'layers')
  try {
    const entries = await fs.readdir(layersDir, { withFileTypes: true })
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
  } catch {
    return []
  }
}

// Get list of collections in a layer
async function getCollectionsInLayer(layer) {
  const collectionsDir = path.join(process.cwd(), 'layers', layer, 'collections')
  try {
    const entries = await fs.readdir(collectionsDir, { withFileTypes: true })
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
  } catch {
    return []
  }
}

// Interactive mode to select collection for deletion
async function interactiveMode() {
  console.log(`\n${colors.bright}Collection Deletion - Interactive Mode${colors.reset}\n`)
  
  // Get available layers
  const layers = await getAvailableLayers()
  if (layers.length === 0) {
    console.error(`${colors.red}No layers found in the project${colors.reset}`)
    process.exit(1)
  }
  
  console.log('Available layers:')
  layers.forEach(layer => console.log(`  - ${layer}`))
  
  const layer = await prompt('\nTarget layer name: ')
  if (!layer || !layers.includes(layer)) {
    console.error(`${colors.red}Invalid layer selected${colors.reset}`)
    process.exit(1)
  }
  
  // Get collections in the selected layer
  const collections = await getCollectionsInLayer(layer)
  if (collections.length === 0) {
    console.error(`${colors.red}No collections found in layer '${layer}'${colors.reset}`)
    process.exit(1)
  }
  
  console.log(`\nAvailable collections in '${layer}':`)
  collections.forEach(collection => console.log(`  - ${collection}`))
  
  const name = await prompt('\nCollection name to delete: ')
  if (!name || !collections.includes(name)) {
    console.error(`${colors.red}Invalid collection selected${colors.reset}`)
    process.exit(1)
  }
  
  const dropTable = (await prompt('\nDrop database table? (y/n) [n]: ')).toLowerCase() === 'y'
  
  return { name, layer, dropTable }
}

// Remove collection directory
async function removeCollectionDirectory(name, layer) {
  const cases = toCase(name)
  const collectionDir = path.join(process.cwd(), 'layers', layer, 'collections', cases.plural)
  
  try {
    await removeDirectoryRecursive(collectionDir)
    console.log(`${colors.green}✓${colors.reset} Removed collection directory`)
    return true
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Failed to remove collection directory:`, error.message)
    return false
  }
}

// Helper function to recursively remove a directory
async function removeDirectoryRecursive(dir) {
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
}

// Update layer's nuxt.config.ts to remove collection from extends
async function updateLayerNuxtConfig(name, layer) {
  const cases = toCase(name)
  const configPath = path.join(process.cwd(), 'layers', layer, 'nuxt.config.ts')
  
  try {
    let config = await fs.readFile(configPath, 'utf-8')
    
    // Find and update the extends array
    const extendsRegex = /extends:\s*\[([\s\S]*?)\]/m
    const match = config.match(extendsRegex)
    
    if (match) {
      const currentExtends = match[1]
      const lines = currentExtends
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.includes(`collections/${cases.plural}`))
      
      if (lines.length > 0) {
        // Rebuild extends array with proper formatting
        const formattedLines = lines.map((line, index) => {
          // Remove trailing comma and quotes, then re-add them properly
          const cleanLine = line.replace(/[,'"`]/g, '').trim()
          const formattedLine = `    './${cleanLine}'`
          return index < lines.length - 1 ? formattedLine + ',' : formattedLine
        })
        
        const updatedExtends = formattedLines.join('\n')
        config = config.replace(match[0], `extends: [\n${updatedExtends}\n  ]`)
      } else {
        // No more collections, set extends to empty array
        config = config.replace(match[0], 'extends: [\n  ]')
      }
      
      await fs.writeFile(configPath, config)
      console.log(`${colors.green}✓${colors.reset} Updated ${layer} layer nuxt.config.ts`)
      return true
    }
  } catch (error) {
    console.error(`${colors.yellow}!${colors.reset} Could not update layer nuxt.config.ts:`, error.message)
    return false
  }
}

// Update schema index to remove collection export
async function updateSchemaIndex(name, layer) {
  const cases = toCase(name)
  const schemaIndexPath = path.join(process.cwd(), 'server', 'database', 'schema', 'index.ts')
  
  try {
    let content = await fs.readFile(schemaIndexPath, 'utf-8')
    
    // Remove lines that export this collection's schema
    const lines = content.split('\n')
    const filteredLines = lines.filter(line => {
      const trimmedLine = line.trim()
      // Check for the exact export pattern used by generate-collection
      // Pattern: export * from '../../../layers/{layer}/collections/{plural}/server/database/schema'
      return !(
        trimmedLine.includes(`layers/${layer}/collections/${cases.plural}/server/database/schema`)
      )
    })
    
    content = filteredLines.join('\n')
    
    await fs.writeFile(schemaIndexPath, content)
    console.log(`${colors.green}✓${colors.reset} Updated schema index`)
    return true
  } catch (error) {
    console.error(`${colors.yellow}!${colors.reset} Could not update schema index:`, error.message)
    return false
  }
}

// Check if layer has any remaining collections
async function layerHasCollections(layer) {
  const collections = await getCollectionsInLayer(layer)
  return collections.length > 0
}

// Optionally remove layer from root nuxt.config if empty
async function cleanupRootNuxtConfig(layer) {
  // Check if layer still has collections
  if (await layerHasCollections(layer)) {
    return true // Layer still has collections, don't remove from root
  }
  
  const shouldRemove = (await prompt(`\n${colors.yellow}Layer '${layer}' has no more collections. Remove it completely? (y/n) [n]: ${colors.reset}`)).toLowerCase() === 'y'
  
  if (!shouldRemove) {
    return true
  }
  
  const rootConfigPath = path.join(process.cwd(), 'nuxt.config.ts')
  
  try {
    let config = await fs.readFile(rootConfigPath, 'utf-8')
    
    // Find and update the extends array
    const extendsRegex = /extends:\s*\[([\s\S]*?)\]/m
    const match = config.match(extendsRegex)
    
    if (match) {
      const currentExtends = match[1]
      const lines = currentExtends
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.includes(`layers/${layer}`))
      
      if (lines.length > 0) {
        // Rebuild extends array with proper formatting
        const formattedLines = lines.map((line, index) => {
          // Clean up the line and reformat
          const cleanLine = line.replace(/[,'"`]/g, '').trim()
          const formattedLine = `    '${cleanLine}'`
          return index < lines.length - 1 ? formattedLine + ',' : formattedLine
        })
        
        const updatedExtends = formattedLines.join('\n')
        config = config.replace(match[0], `extends: [\n${updatedExtends}\n  ]`)
      } else {
        // No more layers, set extends to empty array
        config = config.replace(match[0], 'extends: [\n  ]')
      }
      
      await fs.writeFile(rootConfigPath, config)
      console.log(`${colors.green}✓${colors.reset} Removed layer '${layer}' from root nuxt.config.ts`)
    }
  } catch (error) {
    console.error(`${colors.yellow}!${colors.reset} Could not update root nuxt.config.ts:`, error.message)
  }
  
  // Now also remove the empty layer directory
  const layerDir = path.join(process.cwd(), 'layers', layer)
  try {
    // Check if collections directory is empty or only has collections dir
    const collectionsDir = path.join(layerDir, 'collections')
    try {
      const collectionsContent = await fs.readdir(collectionsDir)
      if (collectionsContent.length === 0) {
        // Remove empty collections directory
        await fs.rmdir(collectionsDir)
      }
    } catch {
      // Collections dir doesn't exist, that's fine
    }
    
    // Check if layer directory has any other content
    const layerContent = await fs.readdir(layerDir)
    const hasOnlyConfig = layerContent.length === 1 && layerContent[0] === 'nuxt.config.ts'
    const isEmpty = layerContent.length === 0
    
    if (isEmpty || hasOnlyConfig) {
      // Remove the layer directory completely
      await removeDirectoryRecursive(layerDir)
      console.log(`${colors.green}✓${colors.reset} Removed empty layer directory '${layer}'`)
    } else {
      console.log(`${colors.yellow}!${colors.reset} Layer directory '${layer}' contains other files and was not removed`)
      console.log(`  Remaining files: ${layerContent.filter(f => f !== 'nuxt.config.ts').join(', ')}`)
    }
  } catch (error) {
    console.error(`${colors.yellow}!${colors.reset} Could not remove layer directory:`, error.message)
  }
  
  return true
}

// Generate database migration to drop table
async function dropDatabaseTable(name) {
  const cases = toCase(name)
  
  console.log(`\n${colors.yellow}⚠ Database Table Removal${colors.reset}`)
  console.log(`${colors.yellow}The table '${cases.plural}' needs to be dropped manually.${colors.reset}`)
  console.log(`\nTo drop the table, you can:`)
  console.log(`1. Create a migration file to drop the table`)
  console.log(`2. Run: ${colors.bright}pnpm db:generate${colors.reset} to generate migrations`)
  console.log(`3. Run: ${colors.bright}pnpm db:push${colors.reset} to apply changes`)
  console.log(`\nAlternatively, manually drop the table from your database.`)
  
  const generateMigration = (await prompt(`\nGenerate migration now? (y/n) [n]: `)).toLowerCase() === 'y'
  
  if (generateMigration) {
    try {
      console.log(`${colors.yellow}↻${colors.reset} Generating database migration...`)
      const { stdout, stderr } = await execAsync('pnpm db:generate')
      if (stderr && !stderr.includes('Warning')) {
        console.error(`${colors.yellow}!${colors.reset} Drizzle warnings:`, stderr)
      }
      console.log(`${colors.green}✓${colors.reset} Migration generated. Run 'pnpm db:push' to apply.`)
      return true
    } catch (error) {
      console.error(`${colors.red}✗${colors.reset} Failed to generate migration:`, error.message)
      return false
    }
  }
  
  return true
}

// Show what will be deleted
async function showDeletionSummary(name, layer, dropTable) {
  const cases = toCase(name)
  
  console.log(`\n${colors.yellow}⚠ The following will be deleted:${colors.reset}`)
  console.log(`  ${colors.red}✗${colors.reset} Collection directory: layers/${layer}/collections/${cases.plural}/`)
  console.log(`  ${colors.red}✗${colors.reset} Layer config entry: extends array in layers/${layer}/nuxt.config.ts`)
  console.log(`  ${colors.red}✗${colors.reset} Schema export: from server/database/schema/index.ts`)
  
  if (dropTable) {
    console.log(`  ${colors.red}✗${colors.reset} Database table: ${cases.plural} (requires migration)`)
  }
  
  const confirm = await prompt(`\n${colors.bright}Are you sure you want to delete the '${cases.plural}' collection? (yes/no): ${colors.reset}`)
  
  return confirm.toLowerCase() === 'yes'
}

// Main deletion function
async function deleteCollection(config) {
  const { name, layer, dropTable } = config
  const cases = toCase(name)
  
  console.log(`\n${colors.bright}Deleting collection: ${cases.plural} from layer: ${layer}${colors.reset}\n`)
  
  let success = true
  
  // 1. Remove collection directory
  if (!await removeCollectionDirectory(name, layer)) {
    success = false
  }
  
  // 2. Update layer's nuxt.config.ts
  if (!await updateLayerNuxtConfig(name, layer)) {
    success = false
  }
  
  // 3. Update schema index
  if (!await updateSchemaIndex(name, layer)) {
    success = false
  }
  
  // 4. Clean up root nuxt.config if layer is empty
  await cleanupRootNuxtConfig(layer)
  
  // 5. Handle database table
  if (dropTable) {
    if (!await dropDatabaseTable(name)) {
      success = false
    }
  }
  
  return success
}

// Main function
async function main() {
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
      console.log(`\nUsage: pnpm delete:collection <name> --layer=<layer_name> [options]`)
      console.log(`\nExample:`)
      console.log(`  pnpm delete:collection products --layer=test`)
      console.log(`  pnpm delete:collection products --layer=test --drop-table`)
      console.log(`\nOptions:`)
      console.log(`  --layer=<name>     Target layer directory (required)`)
      console.log(`  --drop-table       Also drop the database table`)
      console.log(`  --interactive, -i  Interactive mode`)
      console.log(`  --force           Skip confirmation prompt\n`)
      process.exit(1)
    }
    
    const layer = layerArg.split('=')[1]
    if (!layer) {
      console.error(`${colors.red}✗ Error: Layer name cannot be empty${colors.reset}`)
      process.exit(1)
    }
    
    config = {
      name,
      layer,
      dropTable: args.includes('--drop-table'),
      force: args.includes('--force')
    }
  }
  
  // Check if collection exists
  if (!await checkCollectionExists(config.name, config.layer)) {
    const cases = toCase(config.name)
    console.error(`${colors.red}✗ Error: Collection '${cases.plural}' not found in layer '${config.layer}'${colors.reset}`)
    
    // Show available collections
    const collections = await getCollectionsInLayer(config.layer)
    if (collections.length > 0) {
      console.log(`\nAvailable collections in '${config.layer}':`)
      collections.forEach(collection => console.log(`  - ${collection}`))
    }
    
    process.exit(1)
  }
  
  // Show deletion summary and confirm (unless --force)
  if (!config.force) {
    const confirmed = await showDeletionSummary(config.name, config.layer, config.dropTable)
    if (!confirmed) {
      console.log(`${colors.yellow}Deletion cancelled${colors.reset}`)
      process.exit(0)
    }
  }
  
  // Perform deletion
  const success = await deleteCollection(config)
  
  if (success) {
    const cases = toCase(config.name)
    console.log(`\n${colors.green}${colors.bright}✨ Collection '${cases.plural}' deleted successfully!${colors.reset}`)
    
    if (config.dropTable) {
      console.log(`\n${colors.yellow}🎯 Next steps:${colors.reset}`)
      console.log(`  1. Review the generated migration files`)
      console.log(`  2. Run: ${colors.bright}pnpm db:push${colors.reset} to apply database changes`)
      console.log(`  3. Restart your dev server: ${colors.bright}pnpm dev${colors.reset}\n`)
    } else {
      console.log(`\n${colors.yellow}🎯 Next steps:${colors.reset}`)
      console.log(`  1. Restart your dev server: ${colors.bright}pnpm dev${colors.reset}`)
      console.log(`  2. The collection has been removed from your application\n`)
    }
  } else {
    console.error(`\n${colors.red}Deletion completed with some errors.${colors.reset}`)
    console.log(`${colors.yellow}Please check the messages above for details.${colors.reset}\n`)
    process.exit(1)
  }
}

// Run the deletion script
main().catch(error => {
  console.error(`${colors.red}Fatal Error:${colors.reset}`, error.message)
  process.exit(1)
})