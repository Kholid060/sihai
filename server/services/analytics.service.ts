import { linkEventsTable, linkSessionsTable } from '~/db/schema';
import { drizzle } from '../lib/drizzle';
import { and, count, eq, gte, sql, sum } from 'drizzle-orm';
import {
  ANALYTICS_INTERVAL_DAY_COUNT,
  type AnalyticsInterval,
} from '../const/analytics.const';
import { subtractCurrentDate } from '~/utils/helper';
import type { AnalyticsQueryValidation } from '../validation/analytics.validation';
import { addCachePrefixKey } from '../utils/server-utils';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';

function getIntervalData(interval: AnalyticsInterval) {
  const trunc = interval === '24h' ? 'hour' : 'day';
  const date = subtractCurrentDate(ANALYTICS_INTERVAL_DAY_COUNT[interval]);

  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);

  return { date, trunc };
}

export const getAnalyticsByClicks = defineCachedFunction(
  async (userId: string, interval: AnalyticsInterval) => {
    const { date, trunc } = getIntervalData(interval);
    const result = await drizzle
      .select({
        event: sum(linkSessionsTable.event).mapWith(Number),
        createdAt: sql`date_trunc('${sql.raw(trunc)}', ${linkSessionsTable.createdAt}) as _date`,
      })
      .from(linkSessionsTable)
      .where(
        and(
          gte(linkSessionsTable.createdAt, date.toISOString()),
          eq(linkSessionsTable.userId, userId),
        ),
      )
      .groupBy(sql`_date`);

    return result;
  },
  { maxAge: 5, getKey: addCachePrefixKey('clicks') },
);

async function queryLinkSessions({
  userId,
  linkId,
  groupBy,
  interval,
}: {
  userId: string;
  linkId?: string;
  groupBy: AnyPgColumn;
  interval: AnalyticsInterval;
}): Promise<{ label: string; event: number }[]> {
  const { date } = getIntervalData(interval);
  const result = await drizzle
    .select({
      label: groupBy,
      event: sum(linkSessionsTable.event).mapWith(Number),
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
    .$dynamic();

  return result;
}

async function queryLinkEvents({
  userId,
  linkId,
  groupBy,
  interval,
}: {
  userId: string;
  linkId?: string;
  groupBy: AnyPgColumn;
  interval: AnalyticsInterval;
}): Promise<{ label: string; event: number }[]> {
  const { date } = getIntervalData(interval);
  const result = drizzle
    .select({
      label: groupBy,
      event: count(sql`*`),
    })
    .from(linkEventsTable)
    .where(
      and(
        gte(linkEventsTable.createdAt, date.toISOString()),
        eq(linkEventsTable.userId, userId),
        linkId ? eq(linkEventsTable.linkId, linkId) : undefined,
      ),
    )
    .groupBy(groupBy);

  console.log(result.toSQL());

  return await result;
}

export const getAnalyticsData = defineCachedFunction(
  (userId: string, { groupBy, interval, linkId }: AnalyticsQueryValidation) => {
    switch (groupBy) {
      case 'country':
        return queryLinkSessions({
          userId,
          linkId,
          interval,
          groupBy: linkSessionsTable.country,
        });
      case 'browser':
        return queryLinkSessions({
          userId,
          linkId,
          interval,
          groupBy: linkSessionsTable.browser,
        });
      case 'language':
        return queryLinkSessions({
          userId,
          linkId,
          interval,
          groupBy: linkSessionsTable.language,
        });
      case 'device':
        return queryLinkSessions({
          userId,
          linkId,
          interval,
          groupBy: linkSessionsTable.device,
        });
      case 'os':
        return queryLinkSessions({
          userId,
          linkId,
          interval,
          groupBy: linkSessionsTable.os,
        });
      case 'link':
        return queryLinkSessions({
          userId,
          linkId,
          interval,
          groupBy: linkSessionsTable.linkId,
        });
      case 'referer':
        return queryLinkEvents({
          userId,
          linkId,
          interval,
          groupBy: linkEventsTable.refDomain,
        });
      case 'target':
        return queryLinkEvents({
          userId,
          linkId,
          interval,
          groupBy: linkEventsTable.target,
        });
      case 'trigger':
        return queryLinkEvents({
          userId,
          linkId,
          interval,
          groupBy: linkEventsTable.trigger,
        });
      default:
        throw new Error(`"${groupBy}" is invalid`);
    }
  },
  { maxAge: 5 },
);
