import { nanoid } from 'nanoid'
import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core'
import { users } from './users'
import { subscriptions } from './subscriptions'
import { relations } from 'drizzle-orm'

export const teams = sqliteTable('teams', {
  id: text('id')
    .primaryKey()
    .$default(() => nanoid()),
  name: text('name').notNull(),
  ownerId: text('ownerId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  logo: text('logo'),
  slug: text('slug').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(
    () => new Date(),
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$onUpdate(
    () => new Date(),
  ),
})

export const teamMembers = sqliteTable('team_members', {
  id: text('id')
    .primaryKey()
    .$default(() => nanoid()),
  teamId: text('teamId')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('member'), // 'owner', 'admin', 'member'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(
    () => new Date(),
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$onUpdate(
    () => new Date(),
  ),
})

export const teamInvites = sqliteTable('team_invites', {
  id: text('id')
    .primaryKey()
    .$default(() => nanoid()),
  teamId: text('teamId')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role').notNull().default('member'),
  token: text('token').notNull(),
  status: text('status').notNull().default('pending'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  acceptedAt: integer('accepted_at', { mode: 'timestamp' }),
  acceptedBy: text('accepted_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$default(
    () => new Date(),
  ),
})

export const teamSettings = sqliteTable('team_settings', {
  id: text('id')
    .primaryKey()
    .$default(() => nanoid()),
  teamId: text('team_id')
    .notNull()
    .unique()
    .references(() => teams.id, { onDelete: 'cascade' }),
  translations: text('translations', { mode: 'json' }).$type<{
    [locale: string]: {
      [key: string]: string
    }
  }>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$default(
    () => new Date(),
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
})

export const emailTemplates = sqliteTable('email_templates', {
  id: text('id')
    .primaryKey()
    .$default(() => nanoid()),
  teamId: text('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'order_confirmation', 'invoice', 'password_reset', etc.
  translations: text('translations', { mode: 'json' }).$type<{
    [locale: string]: {
      subject: string
      body: string
    }
  }>(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
}, (table) => ({
  uniqueTeamType: unique().on(table.teamId, table.type)
}))

export const teamsRelations = relations(teams, ({ many, one }) => ({
  members: many(teamMembers),
  owner: one(users, {
    fields: [teams.ownerId],
    references: [users.id],
  }),
  subscription: one(subscriptions, {
    fields: [teams.id],
    references: [subscriptions.teamId],
  }),
}))

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}))
