import { updateUserPassword } from '~/server/services/user.service';
import { createAPIResponse } from '~/server/utils/server-utils';
import { updateUserPasswordValidation } from '~/server/validation/profile.validation';

export default defineAPIEventHandler(async (event) => {
  await updateUserPassword(
    event.context.drizzle,
    event.context.user.id,
    await getValidatedEventData(event, 'body', updateUserPasswordValidation),
  );
  return createAPIResponse(null);
});
