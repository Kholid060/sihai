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
  char,
  smallint,
} from 'drizzle-orm/pg-core';
import {
  DB_LINK_DESCRIPTION_MAX_LEN,
  DB_USER_NAME_LENGTH,
} from '../server/const/db.const';
import { APP_FREE_PLAN, APP_PLAN_ID } from '../server/const/app.const';
import { ulid } from 'ulidx';
import type {
  LinkQROptionsValidation,
  LinkRuleValidation,
  LinkUTMOptionsValidation,
} from '~/server/validation/link.validation';
import { sql } from 'drizzle-orm';

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
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date().toISOString()),
  name: varchar('name', { length: DB_USER_NAME_LENGTH.max }).notNull(),
});
export type NewUser = typeof profilesTable.$inferInsert;
export type SelectUser = typeof profilesTable.$inferSelect;

export const userPlansTable = pgTable(
  'user_plans',
  {
    id: serial().primaryKey(),
    userId: uuid('user_id')
      .references(() => profilesTable.id, { onDelete: 'cascade' })
      .notNull(),

    name: varchar({ length: 128 }).notNull().default(APP_PLAN_ID.free),

    linksUsage: integer('links_usage').notNull().default(0),
    redirectsUsage: integer('redirects_usage').notNull().default(0),

    rulesLimit: integer('rules_limit')
      .default(APP_FREE_PLAN.maxRules)
      .notNull(),
    linksLimit: integer('links_limit').default(APP_FREE_PLAN.maxUrl).notNull(),
    redirectsLimit: integer('redirects_limit')
      .default(APP_FREE_PLAN.maxRedirect)
      .notNull(),

    periodEnd: timestamp('period_end', {
      mode: 'string',
      withTimezone: true,
    }).notNull(),
    periodStart: timestamp('period_start', {
      mode: 'string',
      withTimezone: true,
    }).notNull(),
  },
  (table) => ({
    userIdIdx: index('uu_user_id_fk').onOnly(table.userId),
  }),
);
export type NewUserPlan = typeof userPlansTable.$inferInsert;
export type SelectUserPlan = typeof userPlansTable.$inferSelect;

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
    title: text('title').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date().toISOString()),
    clicks: integer('clicks').default(0),
    archived: boolean('archived').default(false),
    description: varchar('description', {
      length: DB_LINK_DESCRIPTION_MAX_LEN,
    })
      .notNull()
      .default(''),
    rules: json('rules').notNull().$type<LinkRuleValidation[]>(),
    qrOptions: json('qr_opts').notNull().$type<LinkQROptionsValidation>(),
    utmOptions: json('utm_opts').notNull().$type<LinkUTMOptionsValidation>(),
    target: text().notNull(),
  },
  (table) => ({
    userIdIdx: index('l_user_id').on(table.userId),
    createdAtIdx: index('l_created_at').on(table.createdAt),
    titleSearchIndex: index('l_title_search').using(
      'gin',
      sql`to_tsvector('english', ${table.title})`,
    ),
  }),
);
export type NewLink = typeof linksTable.$inferInsert;
export type SelectLink = typeof linksTable.$inferSelect;

export const linkSessionsTable = pgTable(
  'link_sessions',
  {
    id: text('id').primaryKey(),
    device: varchar('device', { length: 16 }).default(''),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    os: varchar('os', { length: 32 }),
    userId: uuid('user_id')
      .notNull()
      .references(() => profilesTable.id, { onDelete: 'cascade' }),
    country: char('country', { length: 2 }),
    browser: varchar('browser', { length: 32 }),
    language: varchar('language', { length: 16 }),
    event: smallint('event').default(1),
    linkId: text('link_id')
      .notNull()
      .references(() => linksTable.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    userIdIdx: index('user_id').onOnly(table.userId),
    linkIdIdx: index('ls_link_id').onOnly(table.linkId),
    createdAtIdx: index('ls_created_at').onOnly(table.createdAt),
    createdAtDeviceIdx: index('ls_created_at_device').on(
      table.userId,
      table.createdAt,
      table.device,
    ),
    createdAtOsIdx: index('ls_created_at_os').on(table.createdAt, table.os),
    createdAtCountryIdx: index('ls_created_at_country').on(
      table.userId,
      table.createdAt,
      table.country,
    ),
    createdAtBrowserIdx: index('ls_created_at_browser').on(
      table.userId,
      table.createdAt,
      table.browser,
    ),
    createdAtLanguageIdx: index('ls_created_at_language').on(
      table.userId,
      table.createdAt,
      table.language,
    ),
  }),
);
export type NewLinkSession = typeof linkSessionsTable.$inferInsert;
export type SelectLinkSession = typeof linkSessionsTable.$inferSelect;

export const linkEventsTable = pgTable(
  'link_events',
  {
    id: serial().primaryKey(),
    trigger: varchar('trigger', { length: 32 }),
    userId: uuid('user_id')
      .notNull()
      .references(() => profilesTable.id, { onDelete: 'cascade' }),
    target: varchar('target', { length: 500 }).default(''),
    refPath: varchar('ref_path', { length: 500 }).default(''),
    refDomain: varchar('ref_domain', { length: 500 }).default(''),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    linkId: text('link_id')
      .notNull()
      .references(() => linksTable.id, { onDelete: 'cascade' }),
    linkSessionId: text('link_session_id')
      .references(() => linkSessionsTable.id)
      .notNull(),
  },
  (table) => ({
    linkIdIdx: index('le_link_id').onOnly(table.linkId),
    userIdIdx: index('le_user_id').onOnly(table.userId),
    createdAtIdx: index('le_created_at').onOnly(table.createdAt),
    createdAtRefDomainIdx: index('le_created_at_ref_domain').on(
      table.userId,
      table.createdAt,
      table.refDomain,
    ),
    createdAtTriggerIdx: index('le_created_at_trigger').on(
      table.userId,
      table.createdAt,
      table.trigger,
    ),
    createdAtTargetIdx: index('le_created_at_target').on(
      table.userId,
      table.createdAt,
      table.target,
    ),
  }),
);
export type NewLinkEvent = typeof linkEventsTable.$inferInsert;
export type SelectLinkEvent = typeof linkEventsTable.$inferSelect;
