import { linkEventsTable, linkSessionsTable, linksTable } from '~/db/schema';
import type { DrizzleDB } from '../lib/drizzle';
import { and, desc, eq, gte, sql, sum } from 'drizzle-orm';
import {
  ANALYTICS_INTERVAL_DAY_COUNT,
  type AnalyticsInterval,
} from '../const/analytics.const';
import { subtractCurrentDate } from '~/utils/helper';
import type { AnalyticsQueryValidation } from '../validation/analytics.validation';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { hash } from 'ohash';

function getIntervalData(interval: AnalyticsInterval) {
  const trunc = interval === '24h' ? 'hour' : 'day';
  const date = subtractCurrentDate(ANALYTICS_INTERVAL_DAY_COUNT[interval]);

  if (interval !== '24h') date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);

  return { date, trunc };
}

export const getAnalyticsByClicks = defineCachedFunction(
  async (
    db: DrizzleDB,
    {
      linkId,
      userId,
      interval,
    }: {
      userId: string;
      linkId?: string;
      interval: AnalyticsInterval;
    },
  ) => {
    const { date, trunc } = getIntervalData(interval);
    const result = await db
      .select({
        event: sum(linkSessionsTable.event).mapWith(Number),
        createdAt: sql`date_trunc('${sql.raw(trunc)}', ${linkSessionsTable.createdAt}) as _date`,
      })
      .from(linkSessionsTable)
      .where(
        and(
          gte(linkSessionsTable.createdAt, date.toISOString()),
          eq(linkSessionsTable.userId, userId),
          linkId ? eq(linkSessionsTable.linkId, linkId) : undefined,
        ),
      )
      .groupBy(sql`_date`);

    return result;
  },
  {
    maxAge: 5,
    getKey: (_arg, params) => hash(params),
  },
);

async function queryLinkSessions(
  db: DrizzleDB,
  {
    userId,
    linkId,
    groupBy,
    interval,
  }: {
    userId: string;
    linkId?: string;
    groupBy: AnyPgColumn;
    interval: AnalyticsInterval;
  },
): Promise<{ label: string; event: number }[]> {
  const { date } = getIntervalData(interval);
  const result = await db
    .select({
      label: groupBy,
      event: sql`SUM(${linkSessionsTable.event}) as _sum`.mapWith(Number),
    })
    .from(linkSessionsTable)
    .where(
      and(
        gte(linkSessionsTable.createdAt, date.toISOString()),
        eq(linkSessionsTable.userId, userId),
        linkId ? eq(linkSessionsTable.linkId, linkId) : undefined,
      ),
    )
    .groupBy(groupBy)
    .orderBy(desc(sql`_sum`))
    .$dynamic();

  return result;
}

async function queryLinkEvents(
  db: DrizzleDB,
  {
    userId,
    linkId,
    groupBy,
    interval,
  }: {
    userId: string;
    linkId?: string;
    groupBy: AnyPgColumn;
    interval: AnalyticsInterval;
  },
): Promise<{ label: string; event: number }[]> {
  const { date } = getIntervalData(interval);
  const result = await db
    .select({
      label: groupBy,
      event: sql`COUNT(${linkEventsTable.id}) as _count`.mapWith(Number),
    })
    .from(linkEventsTable)
    .where(
      and(
        gte(linkEventsTable.createdAt, date.toISOString()),
        eq(linkEventsTable.userId, userId),
        linkId ? eq(linkEventsTable.linkId, linkId) : undefined,
      ),
    )
    .groupBy(groupBy)
    .orderBy(desc(sql`_count`));

  return result;
}

export const queryTopLinks = defineCachedFunction(
  async (
    db: DrizzleDB,
    {
      userId,
      linkId,
      interval,
    }: {
      userId: string;
      linkId?: string;
      interval: AnalyticsInterval;
    },
  ) => {
    const { date } = getIntervalData(interval);
    const result = await db
      .select({
        label: linksTable.key,
        linkId: linksTable.id,
        event: sql`COUNT(${linksTable.id}) as _count`.mapWith(Number),
      })
      .from(linkEventsTable)
      .where(
        and(
          gte(linkEventsTable.createdAt, date.toISOString()),
          eq(linkEventsTable.userId, userId),
          linkId ? eq(linkEventsTable.linkId, linkId) : undefined,
        ),
      )
      .innerJoin(linksTable, eq(linkEventsTable.linkId, linksTable.id))
      .groupBy(linksTable.id)
      .orderBy(desc(sql`_count`));

    return result;
  },
  { getKey: (_, key) => 'analytic-links' + hash(key), maxAge: 3 },
);

export const getAnalyticsData = defineCachedFunction(
  (
    db: DrizzleDB,
    userId: string,
    { groupBy, interval, linkId }: AnalyticsQueryValidation,
  ) => {
    switch (groupBy) {
      case 'country':
        return queryLinkSessions(db, {
          userId,
          linkId,
          interval,
          groupBy: linkSessionsTable.country,
        });
      case 'browser':
        return queryLinkSessions(db, {
          userId,
          linkId,
          interval,
          groupBy: linkSessionsTable.browser,
        });
      case 'language':
        return queryLinkSessions(db, {
          userId,
          linkId,
          interval,
          groupBy: linkSessionsTable.language,
        });
      case 'device':
        return queryLinkSessions(db, {
          userId,
          linkId,
          interval,
          groupBy: linkSessionsTable.device,
        });
      case 'os':
        return queryLinkSessions(db, {
          userId,
          linkId,
          interval,
          groupBy: linkSessionsTable.os,
        });
      case 'referer':
        return queryLinkEvents(db, {
          userId,
          linkId,
          interval,
          groupBy: linkEventsTable.refDomain,
        });
      case 'target':
        return queryLinkEvents(db, {
          userId,
          linkId,
          interval,
          groupBy: linkEventsTable.target,
        });
      case 'trigger':
        return queryLinkEvents(db, {
          userId,
          linkId,
          interval,
          groupBy: linkEventsTable.trigger,
        });
      default:
        throw new Error(`"${groupBy}" is invalid`);
    }
  },
  { maxAge: 5, getKey: (_, userId, param) => userId + hash(param) },
);
