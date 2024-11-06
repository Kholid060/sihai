import { authGuard } from '~/server/guards/auth.guard';
import { updateUserProfile } from '~/server/services/user.service';
import { createAPIResponse } from '~/server/utils/server-utils';
import { updateProfileValidation } from '~/server/validation/profile.validation';

export default defineEventHandler({
  onRequest: [authGuard],
  async handler(event) {
    await updateUserProfile(
      event.context.user.id,
      await getValidatedEventData(event, 'body', updateProfileValidation),
    );
    return createAPIResponse(null);
  },
});
