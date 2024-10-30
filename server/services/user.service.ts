import { profilesTable, userPlansTable } from '~/db/schema';
import { drizzle } from '../lib/drizzle';
import { eq } from 'drizzle-orm';
import type { UserProfile } from '~/interface/user.interface';

export const getUserProfile = defineCachedFunction(
  async (userId: string): Promise<UserProfile> => {
    const [profile] = await drizzle
      .select({
        id: profilesTable.id,
        name: profilesTable.name,
        email: profilesTable.email,
        plan: {
          name: userPlansTable.name,
          periodEnd: userPlansTable.periodEnd,
          rulesLimit: userPlansTable.rulesLimit,
          linksLimit: userPlansTable.linksLimit,
          linksUsage: userPlansTable.linksUsage,
          redirectsUsage: userPlansTable.redirectsUsage,
          redirectsLimit: userPlansTable.redirectsLimit,
        },
      })
      .from(profilesTable)
      .where(eq(profilesTable.id, userId))
      .leftJoin(userPlansTable, eq(userPlansTable.userId, userId))
      .limit(1);

    if (!profile.plan) {
      const periodStart = new Date();
      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 30);

      const [result] = await drizzle
        .insert(userPlansTable)
        .values({
          userId,
          periodEnd: periodEnd.toISOString(),
          periodStart: periodStart.toISOString(),
        })
        .returning();
      profile.plan = {
        name: result.name,
        periodEnd: result.periodEnd,
        linksLimit: result.linksLimit,
        linksUsage: result.linksUsage,
        rulesLimit: result.rulesLimit,
        redirectsLimit: result.redirectsLimit,
        redirectsUsage: result.redirectsUsage,
      };
    }

    return profile as UserProfile;
  },
  { maxAge: 5 },
);
