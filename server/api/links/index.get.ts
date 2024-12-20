import { findLinksByUser } from '~/server/services/link.service';
import {
  createAPIResponse,
  getValidatedEventData,
} from '~/server/utils/server-utils';
import { linkQueryValidation } from '~/server/validation/link.validation';

export default defineAPIEventHandler(async (event) => {
  const query = await getValidatedEventData(
    event,
    'query',
    linkQueryValidation,
  );

  return createAPIResponse(
    await findLinksByUser(event.context.drizzle, event.context.user.id, query),
  );
});
