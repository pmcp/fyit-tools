#!/usr/bin/env node

import fs from 'fs/promises'
import { glob } from 'glob'
import path from 'path'

// Pattern to find the problematic watchEffect block
const WATCH_EFFECT_PATTERN = /\/\/ Compute what the initial values[\s\S]*?watchEffect\(\(\) => \{[\s\S]*?Object\.assign\(state, initialValues\)[\s\S]*?\}\)/g

// Pattern to find the getInitialValues function
const GET_INITIAL_VALUES_PATTERN = /const getInitialValues = \(\) => \{[\s\S]*?\n\}/g

// Pattern to find reactive state declaration
const REACTIVE_STATE_PATTERN = /const state = reactive<([^>]+)>\(([\s\S]*?)\n\}\)/

async function fixForm(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8')
    const originalContent = content

    // Check if this file needs fixing
    if (!content.includes('watchEffect') || !content.includes('Object.assign')) {
      return { status: 'skipped', reason: 'No problematic pattern found' }
    }

    // Extract the type and state fields from reactive declaration
    const reactiveMatch = content.match(REACTIVE_STATE_PATTERN)
    if (!reactiveMatch) {
      return { status: 'error', reason: 'Could not find reactive state declaration' }
    }

    const stateType = reactiveMatch[1]

    // Extract collection name from the composable usage
    const composableMatch = content.match(/const \{ defaultValue, schema(?:, collection)? \} = use(\w+)\(\)/)
    if (!composableMatch) {
      return { status: 'error', reason: 'Could not find composable usage' }
    }

    const composableName = composableMatch[1]

    // Check if collection is already destructured
    const hasCollection = content.includes('{ defaultValue, schema, collection }')

    // Build the new initialization code
    const newInitialization = `// Initialize form state with proper values (no watch needed!)
const initialValues = props.action === 'update' && props.activeItem?.id
  ? { ...defaultValue, ...props.activeItem }
  : { ...defaultValue }

const state = ref<${stateType}>(initialValues)`

    // Remove the getInitialValues function
    content = content.replace(GET_INITIAL_VALUES_PATTERN, '')

    // Remove the watchEffect block
    content = content.replace(WATCH_EFFECT_PATTERN, newInitialization)

    // Replace reactive with ref (remove the explicit state initialization)
    content = content.replace(REACTIVE_STATE_PATTERN, '')

    // Fix the composable destructuring if needed
    if (!hasCollection) {
      content = content.replace(
        `const { defaultValue, schema } = use${composableName}()`,
        `const { defaultValue, schema, collection } = use${composableName}()`
      )
    }

    // Fix the form submit handler to use state.value
    content = content.replace(
      '@submit="send(action, collection, state)"',
      '@submit="send(action, collection, state.value)"'
    )

    // Remove the zod import if it exists (no longer needed)
    content = content.replace(/import { z } from 'zod'\n/, '')

    // Clean up any extra blank lines
    content = content.replace(/\n\n\n+/g, '\n\n')

    // Only write if content actually changed
    if (content !== originalContent) {
      await fs.writeFile(filePath, content)
      return { status: 'fixed' }
    } else {
      return { status: 'skipped', reason: 'No changes needed' }
    }

  } catch (error) {
    return { status: 'error', reason: error.message }
  }
}

async function main() {
  console.log('🔧 Fixing existing form components...\n')

  // Find all form components
  const formFiles = await glob('layers/*/collections/*/app/components/Form.vue')

  console.log(`Found ${formFiles.length} form files to check\n`)

  const results = {
    fixed: [],
    skipped: [],
    errors: []
  }

  for (const file of formFiles) {
    const relativePath = path.relative(process.cwd(), file)
    const result = await fixForm(file)

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

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Migration Summary:')
  console.log('='.repeat(60))
  console.log(`✅ Fixed: ${results.fixed.length} files`)
  console.log(`⏭️  Skipped: ${results.skipped.length} files`)
  console.log(`❌ Errors: ${results.errors.length} files`)

  if (results.fixed.length > 0) {
    console.log('\n📝 Fixed files:')
    results.fixed.forEach(f => console.log(`   - ${f}`))
  }

  if (results.errors.length > 0) {
    console.log('\n⚠️  Files with errors (may need manual fixing):')
    results.errors.forEach(e => console.log(`   - ${e.file}: ${e.reason}`))
  }

  console.log('\n🎉 Migration complete!')

  // Exit with error code if there were errors
  process.exit(results.errors.length > 0 ? 1 : 0)
}

main().catch(console.error)