import { authGuard } from '~/server/guards/auth.guard';
import { getUserProfile } from '~/server/services/user.service';
import { createAPIResponse } from '~/server/utils/server-utils';

export default defineEventHandler({
  onRequest: [authGuard],
  async handler(event) {
    const user = await getUserProfile(event.context.user.id);
    const { id, user_metadata } = event.context.user;

    return createAPIResponse({
      ...user,
      id,
      avatarUrl: user_metadata.avatar_url,
    });
  },
});
