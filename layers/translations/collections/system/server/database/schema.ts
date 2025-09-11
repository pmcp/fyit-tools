import { nanoid } from 'nanoid'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const translationsSystem = sqliteTable('translations_system', {
  id: text('id').primaryKey().$default(() => nanoid()),
  userId: text('userId').notNull(),
  keyPath: text('keyPath').notNull().unique(),
  category: text('category').notNull(),
  values: text('values', { mode: 'json' }).notNull(),
  description: text('description'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$default(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$onUpdate(() => new Date())
})