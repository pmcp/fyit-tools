# 🗂️ Schema Migration System for Layer-Based Nuxt Architecture

This repository provides tools and workflows to migrate existing
**Drizzle schemas** into a **layer-based Nuxt application**.\
It is designed to balance **automation** (for repetitive scaffolding)
with **manual control** (for complex relations and business logic).

------------------------------------------------------------------------

## 📌 Executive Summary

A practical migration tool for importing existing Drizzle schemas from
other projects into a Nuxt application.\
It focuses on **one-way migration** to accelerate development while
maintaining the organizational benefits of the layer architecture:

-   Each **layer** represents a functional module (`cms`, `bookings`,
    `auth`, etc.)\
-   Each layer contains multiple **collections**\
-   Collections within a layer share context and common functionality\
-   Cross-layer references are possible but must be handled carefully

------------------------------------------------------------------------

## ❓ Problem Statement

Migrating schemas and logic from older projects is error-prone.\
We need a repeatable way to:

-   Extract schemas from existing Drizzle exports\
-   Generate Nuxt collections respecting layer boundaries\
-   Automate **simple things** (field extraction, CRUD scaffolding)\
-   Leave **complex things** (relations, business logic, data
    transformation) for manual handling

------------------------------------------------------------------------

## 🏗️ Core Architecture

    layers/
    ├── cms/
    │   ├── nuxt.config.ts
    │   └── collections/
    │       ├── pages/
    │       ├── posts/
    │       └── categories/
    ├── bookings/
    │   ├── nuxt.config.ts
    │   └── collections/
    │       ├── bookingItems/
    │       └── locations/
    └── auth/
        ├── nuxt.config.ts
        └── collections/
            └── users/

------------------------------------------------------------------------

## 🚦 Migration Approach

### **Phase 1 (MVP / Simple Migration)**

-   ✅ Extract basic table fields from Drizzle schemas\
-   ✅ Generate Nuxt collections with `generate-collection.js`\
-   ✅ Skip relations, log them as manual tasks\
-   ✅ Produce migration reports (`.json`) with warnings and next steps

### **Phase 2 (Enhanced Migration)**

-   Add **relation stubs** (commented-out) into schema files\
-   Detect and log **constraints, indexes, and defaults**\
-   Optional: simple **data export/import hooks**

### **Phase 3 (Fuller Integration)**

-   Automated cross-layer reference registry\
-   Smarter type mapping (UUIDs, enums, decimals with precision)\
-   Optional **data migration** strategies

------------------------------------------------------------------------

## ⚙️ Implementation Strategy

1.  **Migration Script (`migrate-simple.js`)**

  -   Wraps around existing `generate-collection.js`\
  -   Extracts scalar fields only\
  -   Calls generator with `--no-db`\
  -   Logs skipped relations

2.  **Migration Reports**\
    Example:

    ``` json
    {
      "layer": "cms",
      "successful": ["pages", "posts", "categories"],
      "warnings": ["posts: has foreign key references"],
      "manualTasks": ["Set up reference: posts.authorId → auth.users"]
    }
    ```

3.  **Developer Workflow**

  -   Run dry run (`--dry-run`)\
  -   Review report\
  -   Run actual migration\
  -   Manually wire up skipped references\
  -   Push DB migrations

------------------------------------------------------------------------

## 🎯 Key Design Decisions

**Kept Simple** - One-way migration only (no syncing)\
- Basic type mapping only\
- Skip relations initially\
- No auto cross-layer references

**Automated** - Field extraction\
- Collection scaffolding\
- Migration reports

**Manual** - Cross-layer references\
- Complex relations (many-to-many, polymorphic)\
- Business logic\
- Constraints and indexes\
- Data migration

------------------------------------------------------------------------

## 🛠️ Usage Workflow

``` bash
# Step 1: Dry run
node scripts/migrate-simple.js ../old/schema.ts cms pages,posts,categories --dry-run

# Step 2: Run actual migration
node scripts/migrate-simple.js ../old/schema.ts cms pages,posts,categories

# Step 3: Review migration report
cat migration-report-cms-<timestamp>.json

# Step 4: Handle manual tasks
# - Add references
# - Add relations
# - Add custom business logic

# Step 5: Push DB migrations
pnpm db:generate
pnpm db:push
```

------------------------------------------------------------------------

## ✅ Success Metrics

-   **Time saved**: 70--80% less effort vs manual recreation\
-   **Consistency**: All collections follow the same scaffolding
    pattern\
-   **Maintainability**: Clear layer boundaries are preserved\
-   **Documentation**: Migration reports serve as built-in project notes

------------------------------------------------------------------------

## 📋 Common Patterns

**Pattern 1: Related Collections**

``` bash
node migrate-simple.js ../old/schema.ts ecommerce products,categories,inventory
```

**Pattern 2: Incremental Migration**

``` bash
node migrate-simple.js ../old/schema.ts core users,teams
node migrate-simple.js ../old/schema.ts cms posts,pages
```

**Pattern 3: Test Migration**

``` bash
node migrate-simple.js ../old/schema.ts test products --dry-run
```

------------------------------------------------------------------------

## 🏁 Conclusion

This migration system is a **practical path from old projects to a
modern, layer-based Nuxt app**.\
It automates repetitive tasks while being explicit about what still
requires manual attention.\
The **key insight**: migration is a **one-time acceleration tool**, not
a permanent synchronization system.

By combining automation + manual control, you get the best of both
worlds: speed without sacrificing correctness.
