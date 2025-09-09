import { nanoid } from 'nanoid'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
// Note: This collection has translatable fields: name, description, terms, conditions
// Translations are stored in a JSON field without indexes for performance baseline

export const posEvents = sqliteTable('pos_events', {
  id: text('id').primaryKey().$default(() => nanoid()),
  teamId: text('teamId').notNull(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  description: text('description'),
  eventType: text('eventType'),
  status: text('status'),
  startDate: integer('startDate', { mode: 'timestamp' }).$default(() => new Date()),
  endDate: integer('endDate', { mode: 'timestamp' }).$default(() => new Date()),
  isActive: integer('isActive', { mode: 'boolean' }).$default(() => false),
  isCurrent: integer('isCurrent', { mode: 'boolean' }).$default(() => false),
  archivedAt: integer('archivedAt', { mode: 'timestamp' }).$default(() => new Date()),
  parentEventId: integer('parentEventId'),
  metadata: text('metadata', { mode: 'json' }),
  // Note: No indexes on translations - measure performance first
  // Add indexes only if queries exceed 50ms with real data
  translations: text('translations', { mode: 'json' }).$type<{
    [locale: string]: {
      name?: string
      description?: string
      terms?: string
      conditions?: string
    }
  }>(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$default(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$onUpdate(() => new Date())
})