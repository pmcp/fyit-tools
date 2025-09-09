import { nanoid } from 'nanoid'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const posSystemlogs = sqliteTable('pos_systemlogs', {
  id: text('id').primaryKey().$default(() => nanoid()),
  teamId: text('teamId').notNull(),
  userId: text('userId').notNull(),
  logType: text('logType'),
  message: text('message'),
  metadata: text('metadata', { mode: 'json' }),
  eventId: integer('eventId'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$default(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$onUpdate(() => new Date())
})