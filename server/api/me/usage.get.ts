import { authGuard } from '~/server/guards/auth.guard';
import { getUserUsage } from '~/server/services/usage.service';
import { createAPIResponse } from '~/server/utils/server-utils';
import { queryUserUsageValidation } from '~/server/validation/profile.validation';

export default defineEventHandler({
  onRequest: [authGuard],
  async handler(event) {
    const query = await getValidatedEventData(
      event,
      'query',
      queryUserUsageValidation,
    );
    const result = await getUserUsage(event.context.user.id, query.type);

    return createAPIResponse(result);
  },
});
