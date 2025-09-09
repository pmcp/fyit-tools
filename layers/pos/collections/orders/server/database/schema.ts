import { nanoid } from 'nanoid'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const posOrders = sqliteTable('pos_orders', {
  id: text('id').primaryKey().$default(() => nanoid()),
  teamId: text('teamId').notNull(),
  userId: text('userId').notNull(),
  eventId: integer('eventId').notNull(),
  clientId: integer('clientId'),
  locationId: integer('locationId'),
  orderNumber: text('orderNumber'),
  status: text('status'),
  paymentMethod: text('paymentMethod'),
  paymentStatus: text('paymentStatus'),
  subtotal: real('subtotal'),
  taxAmount: real('taxAmount'),
  discountAmount: real('discountAmount'),
  totalAmount: real('totalAmount'),
  notes: text('notes'),
  metadata: text('metadata', { mode: 'json' }),
  completedAt: integer('completedAt', { mode: 'timestamp' }).$default(() => new Date()),
  eventOrderNumber: integer('eventOrderNumber'),
  clientName: text('clientName'),
  waiterId: integer('waiterId'),
  personnel: integer('personnel', { mode: 'boolean' }).$default(() => false),
  overallRemarks: text('overallRemarks'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$default(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$onUpdate(() => new Date())
})