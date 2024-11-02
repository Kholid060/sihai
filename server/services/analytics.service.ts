import { linkEventsTable, linkSessionsTable } from '~/db/schema';
import { drizzle } from '../lib/drizzle';
import { and, count, eq, gte, sql, sum } from 'drizzle-orm';
import type { AnalyticsPeriod } from '../const/analytics.const';
import { subtractCurrentDate } from '~/utils/helper';
import type { AnalyticsQueryValidation } from '../validation/analytics.validation';
import { addCachePrefixKey } from '../utils/server-utils';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';

function getPeriodData(period: AnalyticsPeriod) {
  let date: Date;
  let trunc = 'day';

  switch (period) {
    case '24h':
      date = subtractCurrentDate(1);
      trunc = 'hour';
      break;
    case '14d':
      date = subtractCurrentDate(14);
      break;
    case '30d':
      date = subtractCurrentDate(30);
      break;
    case '90d':
      date = subtractCurrentDate(90);
      break;
    default:
      throw new Error('Invalid period');
  }

  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);

  return { date, trunc };
}

export const getAnalyticsByClicks = defineCachedFunction(
  async (userId: string, period: AnalyticsPeriod) => {
    const { date, trunc } = getPeriodData(period);
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
  period,
  userId,
  linkId,
  groupBy,
}: {
  userId: string;
  linkId?: string;
  groupBy: AnyPgColumn;
  period: AnalyticsPeriod;
}): Promise<{ label: string; event: number }[]> {
  const { date } = getPeriodData(period);
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
  period,
  userId,
  linkId,
  groupBy,
}: {
  userId: string;
  linkId?: string;
  groupBy: AnyPgColumn;
  period: AnalyticsPeriod;
}): Promise<{ label: string; event: number }[]> {
  const { date } = getPeriodData(period);
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
  (userId: string, { orderBy, period, linkId }: AnalyticsQueryValidation) => {
    switch (orderBy) {
      case 'country':
        return queryLinkSessions({
          userId,
          period,
          linkId,
          groupBy: linkSessionsTable.country,
        });
      case 'browser':
        return queryLinkSessions({
          userId,
          period,
          linkId,
          groupBy: linkSessionsTable.browser,
        });
      case 'language':
        return queryLinkSessions({
          userId,
          period,
          linkId,
          groupBy: linkSessionsTable.language,
        });
      case 'device':
        return queryLinkSessions({
          userId,
          period,
          linkId,
          groupBy: linkSessionsTable.device,
        });
      case 'os':
        return queryLinkSessions({
          userId,
          period,
          linkId,
          groupBy: linkSessionsTable.os,
        });
      case 'link':
        return queryLinkSessions({
          userId,
          period,
          linkId,
          groupBy: linkSessionsTable.linkId,
        });
      case 'referer':
        return queryLinkEvents({
          userId,
          period,
          linkId,
          groupBy: linkEventsTable.refDomain,
        });
      case 'target':
        return queryLinkEvents({
          userId,
          period,
          linkId,
          groupBy: linkEventsTable.target,
        });
      case 'trigger':
        return queryLinkEvents({
          userId,
          period,
          linkId,
          groupBy: linkEventsTable.trigger,
        });
      default:
        throw new Error(`"${orderBy}" is invalid`);
    }
  },
  { maxAge: 5 },
);
