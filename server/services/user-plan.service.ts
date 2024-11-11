import { userPlansTable } from '~/db/schema';
import { eq } from 'drizzle-orm';
import type { DrizzleDB } from '../lib/drizzle';

export async function getUserPlan(db: DrizzleDB, userId: string) {
  const result = await db
    .select({
      name: userPlansTable.name,
      periodEnd: userPlansTable.periodEnd,
      linksLimit: userPlansTable.linksLimit,
      linksUsage: userPlansTable.linksUsage,
      rulesLimit: userPlansTable.rulesLimit,
      periodStart: userPlansTable.periodStart,
      redirectsLimit: userPlansTable.redirectsLimit,
      redirectsUsage: userPlansTable.redirectsUsage,
    })
    .from(userPlansTable)
    .where(eq(userPlansTable.userId, userId))
    .limit(1);

  return result[0] ?? null;
}
