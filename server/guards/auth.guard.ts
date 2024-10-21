import { serverSupabaseUser } from '#supabase/server';

export const authGuard = defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  event.context.user = user;
});
