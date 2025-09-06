#!/usr/bin/env node

import { execSync } from "child_process"
import { getTableConfig } from "drizzle-orm"
import fs from "fs/promises"
import path from "path"

async function migrateSimple({ source, layer, collections, dryRun = false }) {
  const sourcePath = path.resolve(source)
  const sourceSchema = await import(sourcePath)

  const report = {
    layer,
    successful: [],
    failed: [],
    warnings: [],
    manualTasks: []
  }

  for (const collectionName of collections) {
    try {
      const table = sourceSchema[collectionName]
      if (!table) {
        report.failed.push(`${collectionName}: not found in schema`)
        continue
      }

      const config = getTableConfig(table)
      const fields = extractFields(config)
      const references = detectReferences(config)

      if (references.length > 0) {
        report.warnings.push(`${collectionName}: has foreign key references`)
        report.manualTasks.push(
          ...references.map(
            ref =>
              `Set up reference manually: ${collectionName}.${ref.column} → ${ref.target}`
          )
        )
      }

      if (!dryRun) {
        const fieldArg = fields.length
          ? `--fields="${fields.join(",")}"`
          : ""

        execSync(
          `node scripts/generate-collection.js ${collectionName} --layer=${layer} ${fieldArg} --no-db`,
          { stdio: "inherit" }
        )
      }

      report.successful.push(collectionName)
    } catch (err) {
      report.failed.push(`${collectionName}: ${err.message}`)
    }
  }

  const outPath = `migration-report-${layer}-${Date.now()}.json`
  await fs.writeFile(outPath, JSON.stringify(report, null, 2))
  console.log(`\n✅ Migration report saved to ${outPath}`)
  return report
}

function extractFields(tableConfig) {
  return Object.entries(tableConfig.columns)
    .filter(([_, col]) => !col.references) // skip foreign keys
    .map(([name, col]) => {
      const type = mapDrizzleToSimpleType(col.dataType)
      const required = col.notNull ? ":required" : ""
      return `${name}:${type}${required}`
    })
}

function detectReferences(tableConfig) {
  return Object.entries(tableConfig.columns)
    .filter(([_, col]) => col.references)
    .map(([name, col]) => ({
      column: name,
      target: col.references[0]?.foreignTable || "unknown"
    }))
}

function mapDrizzleToSimpleType(drizzleType) {
  const typeMap = {
    text: "string",
    varchar: "string",
    integer: "number",
    real: "decimal",
    boolean: "boolean",
    timestamp: "date",
    json: "json",
    jsonb: "json"
  }
  return typeMap[drizzleType] || "string"
}

// --- CLI entry ---
const args = process.argv.slice(2)
if (args.length < 3) {
  console.error(
    "Usage: node migrate-simple.js <source-schema> <layer> <collection1,collection2,...> [--dry-run]"
  )
  process.exit(1)
}

const [source, layer, collectionsStr, ...flags] = args
const collections = collectionsStr.split(",")
const dryRun = flags.includes("--dry-run")

migrateSimple({ source, layer, collections, dryRun }).catch(err => {
  console.error("Migration failed:", err)
  process.exit(1)
})
