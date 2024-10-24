import { authGuard } from '~/server/guards/auth.guard';
import { findLinksByUser } from '~/server/services/link.service';
import { createAPIResponse } from '~/server/utils/server-utils';
import { linkQueryValidation } from '~/server/validation/link.validation';

export default defineEventHandler({
  onRequest: [authGuard],
  async handler(event) {
    const query = await getValidatedQuery(event, linkQueryValidation.parse);
    return createAPIResponse(
      await findLinksByUser(event.context.user.id, query),
    );
  },
});