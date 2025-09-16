#!/usr/bin/env node

import { glob } from 'glob'
import fs from 'fs/promises'
import path from 'path'

async function testFormFix() {
  console.log('🧪 Testing form fix validation...\n')

  const formFiles = await glob('layers/*/collections/*/app/components/Form.vue')
  const issues = []
  const stats = {
    total: formFiles.length,
    clean: 0,
    hasWatchEffect: 0,
    hasObjectAssign: 0,
    hasGetInitialValues: 0,
    usesReactive: 0,
    missingStateValue: 0,
    hasZodImport: 0
  }

  for (const file of formFiles) {
    const content = await fs.readFile(file, 'utf8')
    const relativePath = path.relative(process.cwd(), file)
    const fileIssues = []

    // Check for problematic patterns
    if (content.includes('watchEffect')) {
      fileIssues.push('Still has watchEffect')
      stats.hasWatchEffect++
    }

    if (content.includes('Object.assign')) {
      fileIssues.push('Still has Object.assign')
      stats.hasObjectAssign++
    }

    if (content.includes('getInitialValues')) {
      fileIssues.push('Still has getInitialValues function')
      stats.hasGetInitialValues++
    }

    // Check for reactive instead of ref
    if (content.match(/const state = reactive[<(]/)) {
      fileIssues.push('Still using reactive instead of ref')
      stats.usesReactive++
    }

    // Check if submit handler uses state.value
    if (content.includes('@submit="send(action, collection, state)"')) {
      fileIssues.push('Submit handler missing .value (should be state.value)')
      stats.missingStateValue++
    }

    // Check for unnecessary zod import
    if (content.includes("import { z } from 'zod'")) {
      fileIssues.push('Has unnecessary zod import')
      stats.hasZodImport++
    }

    if (fileIssues.length > 0) {
      issues.push({
        file: relativePath,
        issues: fileIssues
      })
    } else {
      stats.clean++
    }
  }

  // Print detailed results
  console.log('📊 Validation Results:')
  console.log('='.repeat(60))
  console.log(`Total forms checked: ${stats.total}`)
  console.log(`✅ Clean forms: ${stats.clean}`)
  console.log(`❌ Forms with issues: ${issues.length}`)

  if (issues.length > 0) {
    console.log('\n⚠️  Detailed Issues:')
    console.log('-'.repeat(60))

    if (stats.hasWatchEffect > 0) {
      console.log(`\n📍 Files with watchEffect (${stats.hasWatchEffect}):`)
      issues.filter(i => i.issues.includes('Still has watchEffect'))
        .forEach(i => console.log(`   - ${i.file}`))
    }

    if (stats.hasObjectAssign > 0) {
      console.log(`\n📍 Files with Object.assign (${stats.hasObjectAssign}):`)
      issues.filter(i => i.issues.includes('Still has Object.assign'))
        .forEach(i => console.log(`   - ${i.file}`))
    }

    if (stats.hasGetInitialValues > 0) {
      console.log(`\n📍 Files with getInitialValues (${stats.hasGetInitialValues}):`)
      issues.filter(i => i.issues.includes('Still has getInitialValues function'))
        .forEach(i => console.log(`   - ${i.file}`))
    }

    if (stats.usesReactive > 0) {
      console.log(`\n📍 Files using reactive instead of ref (${stats.usesReactive}):`)
      issues.filter(i => i.issues.includes('Still using reactive instead of ref'))
        .forEach(i => console.log(`   - ${i.file}`))
    }

    if (stats.missingStateValue > 0) {
      console.log(`\n📍 Files missing .value in submit (${stats.missingStateValue}):`)
      issues.filter(i => i.issues.includes('Submit handler missing .value (should be state.value)'))
        .forEach(i => console.log(`   - ${i.file}`))
    }

    if (stats.hasZodImport > 0) {
      console.log(`\n📍 Files with unnecessary zod import (${stats.hasZodImport}):`)
      issues.filter(i => i.issues.includes('Has unnecessary zod import'))
        .forEach(i => console.log(`   - ${i.file}`))
    }

    console.log('\n' + '-'.repeat(60))
    console.log('Full issue breakdown:')
    for (const issue of issues) {
      console.log(`\n${issue.file}:`)
      issue.issues.forEach(i => console.log(`  ⚠️  ${i}`))
    }
  }

  console.log('\n' + '='.repeat(60))

  if (issues.length === 0) {
    console.log('✅ All forms are properly fixed!')
    console.log('   - No watchEffect patterns')
    console.log('   - No Object.assign usage')
    console.log('   - Using ref instead of reactive')
    console.log('   - Proper state.value in submit handlers')
    return true
  } else {
    console.log(`❌ ${issues.length} forms still have issues`)
    console.log('\n💡 To fix these issues, run:')
    console.log('   node scripts/fix-existing-forms.mjs')
    return false
  }
}

testFormFix().then(success => {
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('Error running tests:', error)
  process.exit(1)
})