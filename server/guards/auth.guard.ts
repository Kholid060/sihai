import { serverSupabaseUser, serverSupabaseSession } from '#supabase/server';

export const authGuard = defineEventHandler(async (event) => {
  const session = await serverSupabaseSession(event);
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  event.context.user = user;
});
