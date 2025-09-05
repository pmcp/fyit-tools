# Collection Generator Documentation

## Overview

The Collection Generator is a powerful tool that automatically creates complete CRUD collections for your application, including database tables, API endpoints, UI components, and all necessary configuration files.

## Installation

The generator is already installed and configured. You can use it immediately with:

```bash
pnpm generate:collection
```

## Usage

### Basic Usage

Generate a collection with default fields (name and description):

```bash
pnpm generate:collection products
```

### With Custom Fields

Specify fields using the format `name:type:required`:

```bash
pnpm generate:collection products --fields="name:string:required,price:decimal:required,inStock:boolean,description:text"
```

### Interactive Mode

Let the generator guide you through the setup:

```bash
pnpm generate:collection --interactive
# or
pnpm generate:collection -i
```

### Skip Database Creation

If you want to create the files without creating the database table:

```bash
pnpm generate:collection products --no-db
```

## Field Types

Supported field types and their mappings:

| Field Type | Database Type | TypeScript | Zod Schema | Default Value |
|------------|--------------|------------|------------|---------------|
| `string` | VARCHAR(255) | string | z.string() | '' |
| `text` | TEXT | string | z.string() | '' |
| `number` | INTEGER | number | z.number() | 0 |
| `decimal` | DECIMAL(10,2) | number | z.number() | 0 |
| `boolean` | BOOLEAN | boolean | z.boolean() | false |
| `date` | DATE | string | z.string() | '' |
| `json` | JSONB | Record<string, any> | z.object({}) | {} |

## What Gets Generated

For a collection named "products", the generator creates:

```
layers/collections/products/
├── app/
│   ├── components/
│   │   ├── Form.vue         # Product form with validation
│   │   └── List.vue         # Product list with table
│   └── composables/
│       └── useProducts.ts   # Schema, columns, and config
├── server/
│   ├── api/teams/[teamId]/products/
│   │   ├── index.get.ts     # GET all products
│   │   ├── index.post.ts    # POST create product
│   │   ├── [productId].patch.ts  # PATCH update product
│   │   └── [productId].delete.ts # DELETE product
│   └── database/
│       ├── queries.ts       # Database query functions
│       └── schema.ts        # Drizzle schema definition
├── types.ts                 # TypeScript interfaces
└── nuxt.config.ts          # Layer configuration
```

**Auto-Registration**: The collection is automatically registered in `layers/collections/nuxt.config.ts`

## Features

Each generated collection includes:

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Zod schema validation
- ✅ TypeScript type safety
- ✅ Optimistic UI updates
- ✅ Team-based multi-tenancy
- ✅ User permissions
- ✅ Error handling and rollback
- ✅ Loading states
- ✅ Toast notifications
- ✅ Responsive forms
- ✅ Data tables with sorting and filtering
- ✅ Database table creation (optional)
- ✅ Auto-registration in collections layer config

## Examples

### E-commerce Products

```bash
pnpm generate:collection products --fields="name:string:required,description:text,price:decimal:required,stock:number:required,featured:boolean"
```

### Blog Posts

```bash
pnpm generate:collection articles --fields="title:string:required,content:text:required,published:boolean,publishDate:date"
```

### Task Management

```bash
pnpm generate:collection tasks --fields="title:string:required,description:text,priority:string,dueDate:date,completed:boolean"
```

## Interactive Mode Example

```bash
$ pnpm generate:collection -i

Collection Generator - Interactive Mode

Collection name (plural, e.g., products): products

Define fields for your collection (press Enter to use defaults):

Field name (or press Enter to finish): name
Field type (string/text/number/decimal/boolean/date) [string]: string
Required field? (y/n) [n]: y

Field name (or press Enter to finish): price
Field type (string/text/number/decimal/boolean/date) [string]: decimal
Required field? (y/n) [n]: y

Field name (or press Enter to finish): inStock
Field type (string/text/number/decimal/boolean/date) [string]: boolean
Required field? (y/n) [n]: n

Field name (or press Enter to finish): 

Create database table? (y/n) [y]: y

Creating collection: products

✓ Created directory structure
✓ Generated app/components/Form.vue
✓ Generated app/components/List.vue
✓ Generated app/composables/useProducts.ts
✓ Generated server/api/teams/[teamId]/products/index.get.ts
✓ Generated server/api/teams/[teamId]/products/index.post.ts
✓ Generated server/api/teams/[teamId]/products/[productId].patch.ts
✓ Generated server/api/teams/[teamId]/products/[productId].delete.ts
✓ Generated server/database/queries.ts
✓ Generated server/database/schema.ts
✓ Generated types.ts
✓ Generated nuxt.config.ts
✓ Updated collections layer nuxt.config.ts
✓ Database table created

✨ Collection 'products' generated successfully!

📁 Location: layers/collections/products/

🎯 Next steps:
  1. Review the schema in useProducts.ts
  2. Customize the form fields if needed
  3. Restart your dev server: pnpm dev
  4. Your collection is ready to use!
```

## Post-Generation Steps

After generating a collection:

1. **Review the Schema**: Check `app/composables/use[Collection].ts` to ensure fields are correct
2. **Customize the Form**: Edit `app/components/Form.vue` if you need custom input types or validation
3. **Adjust Columns**: Modify the columns array in the composable for table display
4. **Add Business Logic**: Extend the database queries if you need joins or complex operations
5. **Create Pages**: Add pages that use the `<[Collection]List />` component

## Database Management

### Automatic Table Creation

By default, the generator attempts to create the database table using Drizzle. If this fails, you'll see a warning and need to create the table manually.

### Configuration Location

The generator automatically adds your new collection to the `extends` array in `layers/collections/nuxt.config.ts`. This centralizes all collection registrations in one place, making it easier to manage which collections are active.

### Manual Table Creation

If automatic creation fails, you can:

1. Check the generated schema in `server/database/schema.ts`
2. Run migrations manually: `pnpm drizzle-kit push:pg`
3. Or create the table using your database client

### Migration Files

The generator creates Drizzle schema files that can be used with drizzle-kit for migrations:

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit push:pg
```

## Customization

### Adding Custom Validation

Edit the schema in `app/composables/use[Collection].ts`:

```typescript
export const productSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive().max(999999),
  email: z.string().email()
})
```

### Custom Form Fields

Modify `app/components/Form.vue` to add custom components:

```vue
<UFormField name="category">
  <USelect v-model="form.category" :options="categoryOptions" />
</UFormField>
```

### Adding Relations

For complex queries with joins, modify `server/database/queries.ts`:

```typescript
export async function getAllProductsWithCategory(event: H3Event) {
  const db = useDB()
  const products = await db
    .select()
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
  
  return products
}
```

## Troubleshooting

### Database Table Creation Fails

- Ensure your database is running
- Check database connection settings
- Verify user has CREATE TABLE permissions
- Run `pnpm drizzle-kit push:pg` manually

### Module Not Found Errors

- Restart the dev server after generating: `pnpm dev`
- Ensure the collection is added to `layers/collections/nuxt.config.ts` extends array

### TypeScript Errors

- Run `nuxt prepare` to regenerate types
- Restart your IDE/TypeScript service

## Best Practices

1. **Use Plural Names**: Collections should be plural (products, not product)
2. **Keep Fields Simple**: Start with basic fields, add complexity later
3. **Test Early**: Generate, test, then customize
4. **Review Generated Code**: Understand what was created before modifying
5. **Use Interactive Mode**: When unsure about field types
6. **Version Control**: Commit after generation, before customization

## Architecture

The generator follows your established patterns:

- **Functional Programming**: Pure functions in utilities
- **Optimistic Updates**: Immediate UI feedback
- **Type Safety**: Full TypeScript coverage
- **Team-Based Security**: Built-in multi-tenancy
- **Consistent Patterns**: Same structure as your posts implementation
- **Centralized Config**: All collections registered in `layers/collections/nuxt.config.ts`

## Support

For issues or questions:
1. Check this documentation
2. Review the generated code comments
3. Compare with the posts implementation
4. Check the main CRUD layer README