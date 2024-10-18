import { serverSupabaseUser } from '#supabase/server';
import type { ServerGuard } from '~/interface/server.interface';

export const authGuard: ServerGuard = async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  event.context.user = user;
};
