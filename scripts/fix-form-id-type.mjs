#!/usr/bin/env node

import fs from 'fs/promises'
import { glob } from 'glob'
import path from 'path'

async function fixFormIdType(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8')
    const originalContent = content

    // Pattern to find the ref state declaration without id type
    const pattern = /const state = ref<(\w+FormData)>\(initialValues\)/

    if (pattern.test(content)) {
      // Add the id type
      content = content.replace(
        pattern,
        'const state = ref<$1 & { id?: string | null }>(initialValues)'
      )

      if (content !== originalContent) {
        await fs.writeFile(filePath, content)
        return { status: 'fixed' }
      }
    }

    return { status: 'skipped', reason: 'Pattern not found or already fixed' }
  } catch (error) {
    return { status: 'error', reason: error.message }
  }
}

async function main() {
  console.log('🔧 Fixing form id types...\n')

  const formFiles = await glob('layers/*/collections/*/app/components/Form.vue')

  console.log(`Found ${formFiles.length} form files to check\n`)

  const results = {
    fixed: [],
    skipped: [],
    errors: []
  }

  for (const file of formFiles) {
    const relativePath = path.relative(process.cwd(), file)
    const result = await fixFormIdType(file)

    switch (result.status) {
      case 'fixed':
        console.log(`✅ Fixed: ${relativePath}`)
        results.fixed.push(relativePath)
        break
      case 'skipped':
        console.log(`⏭️  Skipped: ${relativePath} (${result.reason})`)
        results.skipped.push({ file: relativePath, reason: result.reason })
        break
      case 'error':
        console.log(`❌ Error: ${relativePath} - ${result.reason}`)
        results.errors.push({ file: relativePath, reason: result.reason })
        break
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Summary:')
  console.log('='.repeat(60))
  console.log(`✅ Fixed: ${results.fixed.length} files`)
  console.log(`⏭️  Skipped: ${results.skipped.length} files`)
  console.log(`❌ Errors: ${results.errors.length} files`)

  if (results.fixed.length > 0) {
    console.log('\n📝 Fixed files:')
    results.fixed.forEach(f => console.log(`   - ${f}`))
  }

  console.log('\n🎉 Complete!')
  process.exit(results.errors.length > 0 ? 1 : 0)
}

main().catch(console.error)