import { authGuard } from '~/server/guards/auth.guard';
import { findLinksByUser } from '~/server/services/link.service';
import {
  createAPIResponse,
  getValidatedEventData,
} from '~/server/utils/server-utils';
import { linkQueryValidation } from '~/server/validation/link.validation';

export default defineEventHandler({
  onRequest: [authGuard],
  async handler(event) {
    const query = await getValidatedEventData(
      event,
      'query',
      linkQueryValidation,
    );

    return createAPIResponse(
      await findLinksByUser(event.context.user.id, query),
    );
  },
});
