import { nanoid } from 'nanoid'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const posOrderproducts = sqliteTable('pos_orderproducts', {
  id: text('id').primaryKey().$default(() => nanoid()),
  teamId: text('teamId').notNull(),
  userId: text('userId').notNull(),
  orderId: integer('orderId').notNull(),
  productId: integer('productId').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unitPrice'),
  taxRate: real('taxRate'),
  discountAmount: real('discountAmount'),
  totalAmount: real('totalAmount'),
  notes: text('notes'),
  totalPrice: real('totalPrice'),
  remarks: text('remarks'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$default(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$onUpdate(() => new Date())
})