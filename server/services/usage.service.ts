import { getUserPlan } from './user-plan.service';
import { linkSessionsTable, linksTable } from '~/db/schema';
import { sum, sql, and, eq, between, count } from 'drizzle-orm';
import { drizzle } from '../lib/drizzle';
import type { QueryUserUsageValidation } from '../validation/profile.validation';

export const getUserRedirectsUsage = defineCachedFunction(
  async (userId: string) => {
    const userPlan = await getUserPlan(userId);
    if (!userPlan) return [];

    const result = await drizzle
      .select({
        event: sum(linkSessionsTable.event).mapWith(Number),
        createdAt: sql`date_trunc('day', ${linkSessionsTable.createdAt}) as _date`,
      })
      .from(linkSessionsTable)
      .where(
        and(
          between(
            linkSessionsTable.createdAt,
            userPlan.periodStart,
            userPlan.periodEnd,
          ),
          eq(linkSessionsTable.userId, userId),
        ),
      )
      .groupBy(sql`_date`);
    return result;
  },
  { maxAge: 5, getKey: (userId) => `usage-redirects-${userId}` },
);

export const getUserLinksUsage = defineCachedFunction(
  async (userId: string) => {
    const userPlan = await getUserPlan(userId);
    if (!userPlan) return [];

    const result = await drizzle
      .select({
        event: count(linksTable.createdAt),
        createdAt: sql`date_trunc('day', ${linksTable.createdAt}) as _date`,
      })
      .from(linksTable)
      .where(
        and(
          between(
            linksTable.createdAt,
            userPlan.periodStart,
            userPlan.periodEnd,
          ),
          eq(linksTable.userId, userId),
        ),
      )
      .groupBy(sql`_date`);
    return result;
  },
  { maxAge: 5, getKey: (userId) => `usage-links-${userId}` },
);

export function getUserUsage(
  userId: string,
  type: QueryUserUsageValidation['type'],
) {
  if (type === 'links') return getUserLinksUsage(userId);
  else return getUserRedirectsUsage(userId);
}
