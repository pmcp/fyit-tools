# 🚀 Nuxt CRUD Scaffolder

A complete CRUD collection generator for Nuxt 3 projects with Drizzle ORM.

## What It Generates

For each collection, this tool generates a complete stack:

```
layers/[layer]/collections/[collection]/
├── app/
│   ├── components/
│   │   ├── Form.vue         # CRUD form with validation
│   │   └── List.vue         # Data table with actions
│   └── composables/
│       └── use[Collection].ts   # Zod schema, columns, config
├── server/
│   ├── api/teams/[id]/[collection]/
│   │   ├── index.get.ts     # GET all/by IDs
│   │   ├── index.post.ts    # CREATE
│   │   ├── [id].patch.ts    # UPDATE
│   │   └── [id].delete.ts   # DELETE
│   └── database/
│       ├── queries.ts       # Database query functions
│       └── schema.ts        # Drizzle schema
├── types.ts                 # TypeScript interfaces
└── nuxt.config.ts          # Layer configuration
```

## Installation

1. Copy the entire `Scaffolder` folder into your Nuxt project root
2. Ensure you have the required dependencies:
   ```bash
   pnpm add drizzle-orm zod
   ```

## Usage

### Method 1: Config File (Recommended)

1. Edit `Scaffolder/config.example.js` with your settings
2. Run:
   ```bash
   node Scaffolder/scripts/generate-collection.mjs --config Scaffolder/config.example.js
   ```

### Method 2: Direct CLI

```bash
node Scaffolder/scripts/generate-collection.mjs shop products \
  --fields-file=Scaffolder/schemas/products.json \
  --dialect=pg
```

### Method 3: NPM Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "scaffold": "node Scaffolder/scripts/generate-collection.mjs",
    "scaffold:config": "node Scaffolder/scripts/generate-collection.mjs --config Scaffolder/config.example.js"
  }
}
```

Then run:
```bash
pnpm scaffold:config
```

## Schema Format

Create a JSON file defining your fields:

```json
{
  "id": {
    "type": "string",
    "meta": {
      "primaryKey": true
    }
  },
  "name": {
    "type": "string",
    "meta": {
      "required": true,
      "maxLength": 255
    }
  },
  "price": {
    "type": "decimal",
    "meta": {
      "required": true,
      "precision": 10,
      "scale": 2
    }
  },
  "inStock": {
    "type": "boolean"
  },
  "description": {
    "type": "text"
  },
  "quantity": {
    "type": "number"
  },
  "createdAt": {
    "type": "date"
  },
  "metadata": {
    "type": "json"
  }
}
```

### Supported Types

- `string` - VARCHAR/TEXT field
- `text` - Long text field
- `number` - Integer field
- `decimal` - Decimal/float field
- `boolean` - Boolean field
- `date` - Timestamp field
- `json` - JSON/JSONB field

### Field Metadata

- `primaryKey: true` - Mark as primary key
- `required: true` - Field is required (adds validation)
- `unique: true` - Add unique constraint
- `maxLength: number` - Maximum string length
- `precision: number` - Decimal precision
- `scale: number` - Decimal scale

## Database Dialects

Supports both PostgreSQL and SQLite:

- `pg` - PostgreSQL (uses uuid, jsonb, etc.)
- `sqlite` - SQLite (uses text, integer with modes)

## After Generation

1. Review generated files in `layers/[layer]/collections/[collection]/`
2. Update `server/database/schema/index.ts` to export the new schema:
   ```ts
   export * from '~/layers/[layer]/collections/[collection]/server/database/schema'
   ```
3. Run database migrations
4. The collection auto-registers with your CRUD layer via glob imports
5. Restart your Nuxt dev server

## Requirements

- Nuxt 3
- Drizzle ORM configured
- An existing CRUD layer (like `existingLayer/crud/`)
- Node.js 18+

## CLI Options

- `--fields-file <path>` - Path to JSON schema file
- `--dialect=pg|sqlite` - Database dialect (default: pg)
- `--auto-relations` - Add relation stubs in comments
- `--dry-run` - Preview what will be generated
- `--config <path>` - Use config file instead of CLI args

## Example Workflow

```bash
# 1. Create your schema
echo '{
  "name": { "type": "string", "meta": { "required": true } },
  "email": { "type": "string", "meta": { "required": true, "unique": true } },
  "role": { "type": "string" }
}' > Scaffolder/schemas/users.json

# 2. Generate the collection
node Scaffolder/scripts/generate-collection.mjs admin users \
  --fields-file=Scaffolder/schemas/users.json

# 3. Export schema and migrate
# 4. Your CRUD is ready!
```

## Tips

- Collections auto-discover via glob patterns - no manual registration needed
- The generated API uses team-based access control
- Forms include Zod validation automatically
- All TypeScript types are properly generated
- Components use your existing CRUD layer components (CrudTable, CrudButton, etc.)

## Customization

After generation, you can:
- Modify the Form.vue for custom layouts
- Adjust the List.vue columns
- Add custom query methods
- Extend the API endpoints
- Add business logic to queries

The generated code is yours to modify!