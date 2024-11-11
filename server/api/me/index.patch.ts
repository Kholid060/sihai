import { updateUserProfile } from '~/server/services/user.service';
import { createAPIResponse } from '~/server/utils/server-utils';
import { updateProfileValidation } from '~/server/validation/profile.validation';

export default defineAPIEventHandler(async (event) => {
  await updateUserProfile(
    event.context.drizzle,
    event.context.user.id,
    await getValidatedEventData(event, 'body', updateProfileValidation),
  );
  return createAPIResponse(null);
});
