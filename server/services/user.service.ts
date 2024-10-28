import { plansTable, profilesTable, userUsagesTable } from '~/db/schema';
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
          name: plansTable.name,
          maxUrl: plansTable.maxUrl,
          maxRules: plansTable.maxRules,
          maxRedirect: plansTable.maxRedirect,
        },
        usage: {
          periodEnd: userUsagesTable.periodEnd,
          urlCounts: userUsagesTable.urlCounts,
          redirectCounts: userUsagesTable.redirectCounts,
        },
      })
      .from(profilesTable)
      .where(eq(profilesTable.id, userId))
      .leftJoin(userUsagesTable, eq(userUsagesTable.userId, userId))
      .leftJoin(plansTable, eq(plansTable.id, profilesTable.planId))
      .limit(1);

    if (!profile.usage) {
      const periodStart = new Date();
      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 30);

      const [result] = await drizzle
        .insert(userUsagesTable)
        .values({
          userId,
          periodEnd: periodEnd.toISOString(),
          periodStart: periodStart.toISOString(),
        })
        .returning();
      profile.usage = {
        periodEnd: result.periodEnd,
        urlCounts: result.urlCounts,
        redirectCounts: result.redirectCounts,
      };
    }

    return profile as UserProfile;
  },
  { maxAge: 5 },
);
