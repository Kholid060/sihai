import { eq } from 'drizzle-orm';
import { profilesTable } from '~/db/schema';
import { authGuard } from '~/server/guards/auth.guard';
import { drizzle } from '~/server/lib/drizzle';

export default defineEventHandler({
  onRequest: [authGuard],
  async handler(event) {
    const { id, user_metadata } = event.context.user;
    const [user] = await drizzle
      .select({ name: profilesTable.name, email: profilesTable.email })
      .from(profilesTable)
      .where(eq(profilesTable.id, id))
      .limit(1);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      });
    }

    return {
      ...user,
      id,
      avatarUrl: user_metadata.avatar_url ?? null,
    };
  },
});
