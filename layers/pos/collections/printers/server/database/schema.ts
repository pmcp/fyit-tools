import { nanoid } from 'nanoid'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
// Note: This collection has translatable fields: name, statusMessage
// Translations are stored in a JSON field without indexes for performance baseline

export const posPrinters = sqliteTable('pos_printers', {
  id: text('id').primaryKey().$default(() => nanoid()),
  teamId: text('teamId').notNull(),
  userId: text('userId').notNull(),
  eventId: integer('eventId').notNull(),
  name: text('name').notNull(),
  ipAddress: text('ipAddress'),
  port: integer('port'),
  status: integer('status'),
  showPrices: integer('showPrices', { mode: 'boolean' }).$default(() => false),
  locationId: integer('locationId'),
  priority: integer('priority'),
  healthStatus: text('healthStatus'),
  lastSuccessAt: integer('lastSuccessAt', { mode: 'timestamp' }).$default(() => new Date()),
  lastFailureAt: integer('lastFailureAt', { mode: 'timestamp' }).$default(() => new Date()),
  consecutiveFailures: integer('consecutiveFailures'),
  // Note: No indexes on translations - measure performance first
  // Add indexes only if queries exceed 50ms with real data
  translations: text('translations', { mode: 'json' }).$type<{
    [locale: string]: {
      name?: string
      statusMessage?: string
    }
  }>(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$default(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$onUpdate(() => new Date())
})