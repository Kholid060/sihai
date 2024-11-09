import type { NewUser, SelectUserPlan } from '~/db/schema';
import { profilesTable, userPlansTable } from '~/db/schema';
import { useDrizzle } from '../lib/drizzle';
import { eq } from 'drizzle-orm';
import type { UserProfile } from '~/interface/user.interface';
import type { UpdateUserPasswordValidation } from '../validation/profile.validation';

export const getUserProfile = defineCachedFunction(
  async (userId: string): Promise<UserProfile> => {
    const drizzle = useDrizzle();
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
          periodStart: userPlansTable.periodStart,
          redirectsUsage: userPlansTable.redirectsUsage,
          redirectsLimit: userPlansTable.redirectsLimit,
        },
      })
      .from(profilesTable)
      .where(eq(profilesTable.id, userId))
      .leftJoin(userPlansTable, eq(userPlansTable.userId, userId))
      .limit(1);

    if (
      !profile.plan ||
      Date.now() > new Date(profile.plan.periodEnd).getTime()
    ) {
      const periodStart = new Date();
      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 30);

      let result: SelectUserPlan;

      if (profile.plan) {
        [result] = await drizzle
          .update(userPlansTable)
          .set({
            linksUsage: 0,
            redirectsUsage: 0,
            periodEnd: periodEnd.toISOString(),
            periodStart: periodStart.toISOString(),
          })
          .where(eq(userPlansTable.userId, userId))
          .returning();
      } else {
        [result] = await drizzle
          .insert(userPlansTable)
          .values({
            userId,
            periodEnd: periodEnd.toISOString(),
            periodStart: periodStart.toISOString(),
          })
          .returning();
      }

      profile.plan = {
        name: result.name,
        periodEnd: result.periodEnd,
        linksLimit: result.linksLimit,
        linksUsage: result.linksUsage,
        rulesLimit: result.rulesLimit,
        periodStart: result.periodStart,
        redirectsLimit: result.redirectsLimit,
        redirectsUsage: result.redirectsUsage,
      };
    }

    return profile as UserProfile;
  },
  { maxAge: 5 },
);

export async function updateUserProfile(
  userId: string,
  { name }: Partial<NewUser>,
) {
  await useDrizzle()
    .update(profilesTable)
    .set({ name })
    .where(eq(profilesTable.id, userId));
}

export async function updateUserPassword(
  userId: string,
  {
    newPassword,
    confirmPassword,
    currentPassword,
  }: UpdateUserPasswordValidation,
) {
  if (confirmPassword !== newPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Confirm password is not the same',
    });
  }

  const drizzle = useDrizzle();
  const [user] =
    await drizzle.$client`SELECT id FROM auth.users WHERE id = ${userId} and crypt(${currentPassword}::text, auth.users.encrypted_password) = encrypted_password LIMIT 1`;
  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'The current password is incorrect',
    });
  }

  await drizzle.$client`UPDATE auth.users SET encrypted_password = crypt(${newPassword}, gen_salt('bf')) WHERE id = ${userId}`;
}
