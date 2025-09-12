import { nanoid } from 'nanoid'
import { sqliteTable, text, integer, real, unique } from 'drizzle-orm/sqlite-core'

export const translationsUi = sqliteTable('translations_ui', {
  id: text('id').primaryKey().$default(() => nanoid()),
  userId: text('userId').notNull(),
  teamId: text('teamId'), // null means system/default translation
  namespace: text('namespace').notNull().default('ui'),
  keyPath: text('keyPath').notNull(),
  category: text('category').notNull(),
  values: text('values', { mode: 'json' }).notNull(),
  description: text('description'),
  isOverrideable: integer('isOverrideable', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$default(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$onUpdate(() => new Date())
}, (table) => ({
  uniqueTeamNamespaceKey: unique().on(table.teamId, table.namespace, table.keyPath)
}))