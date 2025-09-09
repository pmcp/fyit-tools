import { nanoid } from 'nanoid'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
// Note: This collection has translatable fields: name, description
// Translations are stored in a JSON field without indexes for performance baseline

export const posCategories = sqliteTable('pos_categories', {
  id: text('id').primaryKey().$default(() => nanoid()),
  teamId: text('teamId').notNull(),
  userId: text('userId').notNull(),
  eventId: integer('eventId').notNull(),
  name: text('name').notNull(),
  color: text('color'),
  icon: text('icon'),
  sortOrder: integer('sortOrder'),
  isActive: integer('isActive', { mode: 'boolean' }).$default(() => false),
  // Note: No indexes on translations - measure performance first
  // Add indexes only if queries exceed 50ms with real data
  translations: text('translations', { mode: 'json' }).$type<{
    [locale: string]: {
      name?: string
      description?: string
    }
  }>(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$default(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$onUpdate(() => new Date())
})