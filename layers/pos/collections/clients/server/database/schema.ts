import { nanoid } from 'nanoid'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
// Note: This collection has translatable fields: notes, description
// Translations are stored in a JSON field without indexes for performance baseline

export const posClients = sqliteTable('pos_clients', {
  id: text('id').primaryKey().$default(() => nanoid()),
  teamId: text('teamId').notNull(),
  userId: text('userId').notNull(),
  eventId: integer('eventId').notNull(),
  name: text('name').notNull(),
  email: text('email'),
  notes: text('notes'),
  active: integer('active', { mode: 'boolean' }).$default(() => false),
  description: text('description'),
  isGlobal: integer('isGlobal', { mode: 'boolean' }).$default(() => false),
  // Note: No indexes on translations - measure performance first
  // Add indexes only if queries exceed 50ms with real data
  translations: text('translations', { mode: 'json' }).$type<{
    [locale: string]: {
      notes?: string
      description?: string
    }
  }>(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$default(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$onUpdate(() => new Date())
})