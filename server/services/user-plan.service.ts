import { userPlansTable } from '~/db/schema';
import { useDrizzle } from '../lib/drizzle';
import { eq } from 'drizzle-orm';

export async function getUserPlan(userId: string) {
  const result = await useDrizzle()
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
