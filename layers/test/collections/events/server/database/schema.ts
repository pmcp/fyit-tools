import { nanoid } from 'nanoid'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const events = sqliteTable('events', {
  id: text('id').primaryKey().$default(() => nanoid()),
  teamId: text('team_id').notNull(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  date: text('date').notNull(),
  location: text('location'),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$onUpdate(() => new Date())
})