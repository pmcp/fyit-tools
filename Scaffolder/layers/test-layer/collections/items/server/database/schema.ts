import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const testLayerItems = sqliteTable('items', {
  id: text('id').primaryKey(),
  teamId: text('teamId').notNull(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  price: real('price').notNull(),
  inStock: integer('inStock', { mode: 'boolean' }).$default(() => false),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$default(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$default(() => new Date())
})