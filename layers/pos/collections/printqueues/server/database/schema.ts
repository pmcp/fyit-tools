import { nanoid } from 'nanoid'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const posPrintqueues = sqliteTable('pos_printqueues', {
  id: text('id').primaryKey().$default(() => nanoid()),
  teamId: text('teamId').notNull(),
  userId: text('userId').notNull(),
  orderId: integer('orderId').notNull(),
  locationId: integer('locationId'),
  printerId: integer('printerId'),
  status: text('status'),
  items: text('items', { mode: 'json' }),
  total: real('total'),
  printMode: text('printMode'),
  isDuplicateOf: integer('isDuplicateOf'),
  startedAt: integer('startedAt', { mode: 'timestamp' }).$default(() => new Date()),
  completedAt: integer('completedAt', { mode: 'timestamp' }).$default(() => new Date()),
  errorMessage: text('errorMessage'),
  retryCount: integer('retryCount'),
  eventId: integer('eventId'),
  printData: text('printData'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$default(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$onUpdate(() => new Date())
})