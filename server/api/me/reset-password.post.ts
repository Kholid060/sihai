import { authGuard } from '~/server/guards/auth.guard';
import { updateUserPassword } from '~/server/services/user.service';
import { createAPIResponse } from '~/server/utils/server-utils';
import { updateUserPasswordValidation } from '~/server/validation/profile.validation';

export default defineEventHandler({
  onRequest: [authGuard],
  async handler(event) {
    await updateUserPassword(
      event.context.user.id,
      await getValidatedEventData(event, 'body', updateUserPasswordValidation),
    );
    return createAPIResponse(null);
  },
});
