import { nanoid } from 'nanoid'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
// Note: This collection has translatable fields: name, description, remarkPrompt
// Translations are stored in a JSON field without indexes for performance baseline

export const posProducts = sqliteTable('pos_products', {
  id: text('id').primaryKey().$default(() => nanoid()),
  teamId: text('teamId').notNull(),
  userId: text('userId').notNull(),
  eventId: integer('eventId').notNull(),
  categoryId: integer('categoryId'),
  locationId: integer('locationId'),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price'),
  isActive: integer('isActive', { mode: 'boolean' }).$default(() => false),
  isTemplate: integer('isTemplate', { mode: 'boolean' }).$default(() => false),
  requiresRemark: integer('requiresRemark', { mode: 'boolean' }).$default(() => false),
  remarkPrompt: text('remarkPrompt'),
  sortOrder: integer('sortOrder'),
  // Note: No indexes on translations - measure performance first
  // Add indexes only if queries exceed 50ms with real data
  translations: text('translations', { mode: 'json' }).$type<{
    [locale: string]: {
      name?: string
      description?: string
      remarkPrompt?: string
    }
  }>(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$default(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$onUpdate(() => new Date())
})