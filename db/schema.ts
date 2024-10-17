import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  pgSchema,
} from 'drizzle-orm/pg-core';
import {
  DB_PLANS_ID_MAX_LENGTH,
  DB_USER_NAME_LENGTH,
} from '../server/const/db.const';
import { APP_PLAN_ID } from '../server/const/app.const';

const authSchema = pgSchema('auth');

const users = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

export const profilesTable = pgTable('profiles', {
  id: uuid('id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  email: varchar('email', { length: 64 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  name: varchar('name', { length: DB_USER_NAME_LENGTH.max }).notNull(),
  planId: varchar('plan_id', { length: DB_PLANS_ID_MAX_LENGTH })
    .default(APP_PLAN_ID.free)
    .references(() => plansTable.id),
});
export type NewUser = typeof profilesTable.$inferInsert;
export type SelectUser = typeof profilesTable.$inferSelect;

export const plansTable = pgTable('plans', {
  id: varchar('id', { length: DB_PLANS_ID_MAX_LENGTH }).primaryKey(),
  name: varchar('name', { length: 32 }),
  maxUrl: integer('max_url').notNull(),
  maxRedirect: integer('max_redirect').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
export type NewPlan = typeof plansTable.$inferInsert;
export type SelectPlan = typeof plansTable.$inferSelect;
