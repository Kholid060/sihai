import { getUserProfile } from '~/server/services/user.service';
import { createAPIResponse } from '~/server/utils/server-utils';

export default defineAPIEventHandler(async (event) => {
  const user = await getUserProfile(
    event.context.drizzle,
    event.context.user.id,
  );
  const { id, user_metadata } = event.context.user;

  return createAPIResponse({
    ...user,
    id,
    avatarUrl: user_metadata.avatar_url,
  });
});
