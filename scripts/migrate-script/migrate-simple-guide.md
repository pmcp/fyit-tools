# 🚀 Simple Schema Migration Guide

Quick workflow for migrating collections from an existing Drizzle schema
into your Nuxt layers.

------------------------------------------------------------------------

## ⚡ Quick Workflow (TL;DR)

``` bash
# 1. Dry run to see what will migrate
node scripts/migrate-simple.js ../old-project/src/db/schema.ts cms pages,posts,categories --dry-run

# 2. Check the generated migration-report-*.json for warnings/manual tasks

# 3. Run the actual migration
node scripts/migrate-simple.js ../old-project/src/db/schema.ts cms pages,posts,categories

# 4. Open schema.ts in each collection and add missing relations manually

# 5. Generate and push DB migrations
pnpm db:generate
pnpm db:push

# 6. Restart dev server
pnpm dev
```

------------------------------------------------------------------------

## 🎯 What This Script Does

-   Reads an existing Drizzle schema file\
-   Extracts **scalar fields** (`string`, `number`, `boolean`, etc.)\
-   Calls your existing `generate-collection.js` script to scaffold
    collections\
-   Skips **relations / foreign keys**, but logs them for manual
    handling\
-   Generates a **migration report** so you know what was migrated and
    what still needs work

------------------------------------------------------------------------

## 📦 Setup

You need: - `scripts/generate-collection.js` (already in repo)\
- `scripts/migrate-simple.js` (this script)\
- Path to your old Drizzle schema
(e.g. `../old-project/src/db/schema.ts`)

------------------------------------------------------------------------

## 🔧 Usage

### Dry Run

Check what will be migrated (does not create files):

``` bash
node scripts/migrate-simple.js ../old-project/src/db/schema.ts cms pages,posts,categories --dry-run
```

### Actual Migration

Generate collections inside the target layer:

``` bash
node scripts/migrate-simple.js ../old-project/src/db/schema.ts cms pages,posts,categories
```

This will: - Create scaffolds under `layers/cms/collections/`\
- Skip database creation (`--no-db`)\
- Write a migration report to `migration-report-cms-<timestamp>.json`

------------------------------------------------------------------------

## 📄 Migration Report

Each run creates a JSON report like:

``` json
{
  "layer": "cms",
  "successful": ["pages", "posts", "categories"],
  "failed": [],
  "warnings": ["posts: has foreign key references"],
  "manualTasks": [
    "Set up reference manually: posts.authorId → auth.users"
  ]
}
```

That tells you what worked, what failed, and what you still need to wire
up.

------------------------------------------------------------------------

## 🛠 Next Steps

1.  Open generated collections under
    `layers/<layer>/collections/<collection>/`.\

2.  Edit `schema.ts` to **add relations** (`.references()` etc.) that
    were skipped.\

3.  Generate DB migration:

    ``` bash
    pnpm db:generate
    pnpm db:push
    ```

4.  Restart dev server:

    ``` bash
    pnpm dev
    ```

------------------------------------------------------------------------

## ⚠️ Limitations

-   Relations, constraints, defaults, and indexes must be added
    manually.\
-   Only one-way migration.\
-   Does **not** migrate data, only schema scaffolds.

------------------------------------------------------------------------

## 📋 Cheatsheet

``` bash
# CMS layer
node scripts/migrate-simple.js ../old-project/src/db/schema.ts cms pages,posts,categories --dry-run
node scripts/migrate-simple.js ../old-project/src/db/schema.ts cms pages,posts,categories

# Bookings layer
node scripts/migrate-simple.js ../old-project/src/db/schema.ts bookings bookingItems,locations --dry-run
node scripts/migrate-simple.js ../old-project/src/db/schema.ts bookings bookingItems,locations

# Test layer (sandbox before real migration)
node scripts/migrate-simple.js ../old-project/src/db/schema.ts test products --dry-run
node scripts/migrate-simple.js ../old-project/src/db/schema.ts test products
```
