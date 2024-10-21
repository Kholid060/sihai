import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  pgSchema,
  text,
  index,
  json,
  boolean,
  serial,
} from 'drizzle-orm/pg-core';
import {
  DB_LINK_DESCRIPTION_MAX_LEN,
  DB_LINK_TITLE_MAX_LEN,
  DB_PLANS_ID_MAX_LENGTH,
  DB_USER_NAME_LENGTH,
} from '../server/const/db.const';
import { APP_PLAN_ID } from '../server/const/app.const';
import { ulid } from 'ulidx';
import type {
  LinkQROptionsValidation,
  LinkRuleValidation,
  LinkUTMOptionsValidation,
} from '~/server/validation/link.validation';

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
    .defaultNow()
    .$onUpdateFn(() => new Date()),
  name: varchar('name', { length: DB_USER_NAME_LENGTH.max }).notNull(),
  planId: varchar('plan_id', { length: DB_PLANS_ID_MAX_LENGTH })
    .default(APP_PLAN_ID.free)
    .references(() => plansTable.id),
});
export type NewUser = typeof profilesTable.$inferInsert;
export type SelectUser = typeof profilesTable.$inferSelect;

export const userUsagesTable = pgTable(
  'user_usages',
  {
    id: serial().primaryKey(),
    userId: uuid('user_id')
      .references(() => profilesTable.id, { onDelete: 'cascade' })
      .notNull(),
    periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
    periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  },
  (table) => ({
    userIdIdx: index('uu_user_id_fk').onOnly(table.userId),
  }),
);

export const plansTable = pgTable(
  'plans',
  {
    id: varchar('id', { length: DB_PLANS_ID_MAX_LENGTH }).primaryKey(),
    name: varchar('name', { length: 32 }),
    maxUrl: integer('max_url').notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    maxRedirect: integer('max_redirect').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('p_user_id_fk').on(table.userId),
  }),
);
export type NewPlan = typeof plansTable.$inferInsert;
export type SelectPlan = typeof plansTable.$inferSelect;

export const linksTable = pgTable(
  'links',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => ulid()),
    key: text('key').unique().notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: DB_LINK_TITLE_MAX_LEN }).default(''),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
    clicks: integer('clicks').default(0),
    archived: boolean('archived').default(false),
    description: varchar('description', {
      length: DB_LINK_DESCRIPTION_MAX_LEN,
    }).default(''),
    rules: json('rules').$type<LinkRuleValidation[]>(),
    qrOptions: json('qr_opts').$type<LinkQROptionsValidation>(),
    utmOptions: json('utm_opts').$type<LinkUTMOptionsValidation>(),
    target: text().notNull(),
  },
  (table) => ({
    userIdIdx: index('l_user_id').on(table.userId),
    createdAtIdx: index('l_created_at').on(table.createdAt),
  }),
);
export type NewLink = typeof linksTable.$inferInsert;
export type SelectLink = typeof linksTable.$inferSelect;
