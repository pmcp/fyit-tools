import { pgTable, varchar, text, integer, numeric, boolean, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core'

export const posProducts = pgTable('pos_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: text('teamId').notNull(),
  userId: text('userId').notNull(),
  eventId: integer('eventId').notNull(),
  categoryId: integer('categoryId'),
  locationId: integer('locationId'),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: numeric('price'),
  isActive: boolean('isActive').$default(() => false),
  isTemplate: boolean('isTemplate').$default(() => false),
  requiresRemark: boolean('requiresRemark').$default(() => false),
  remarkPrompt: text('remarkPrompt'),
  sortOrder: integer('sortOrder'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().$default(() => new Date()),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().$onUpdate(() => new Date())
})