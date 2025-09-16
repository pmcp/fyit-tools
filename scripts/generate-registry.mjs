#!/usr/bin/env node
import { glob } from 'glob'
import fs from 'fs/promises'
import path from 'path'

async function generateRegistry() {
  console.log('🔍 Scanning for collections...')

  const files = await glob('layers/*/collections/*/app/composables/use*.ts')
  const entries = []

  for (const file of files) {
    const parts = file.split('/')
    const layer = parts[1]
    const collection = parts[3]
    const fileName = path.basename(file, '.ts')
    const composableName = fileName

    // Create collection key (e.g., posProducts, translationsUi)
    // Remove 'use' prefix and handle PascalCase to camelCase conversion
    const withoutUse = composableName.replace('use', '')
    const collectionKey = withoutUse.charAt(0).toLowerCase() + withoutUse.slice(1)

    entries.push({
      key: collectionKey,
      composableName: composableName
    })

    console.log(`  ✓ Found: ${collectionKey} (${composableName})`)
  }

  // Generate registry content using #imports
  const registryContent = `// Auto-generated collection registry
// This file is maintained by the scaffolder - do not edit manually

export const collectionRegistry = {
${entries.map(e => `  ${e.key}: () => import('#imports').then(m => m.${e.composableName}),`).join('\n')}
} as const

export type CollectionName = keyof typeof collectionRegistry
`

  // Create registry directory and file
  await fs.mkdir('layers/crud/registry', { recursive: true })
  await fs.writeFile('layers/crud/registry/collections.ts', registryContent)

  console.log(`\n✅ Generated registry with ${entries.length} collections`)
}

generateRegistry().catch(console.error)