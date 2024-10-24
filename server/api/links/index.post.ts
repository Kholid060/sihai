import { authGuard } from '~/server/guards/auth.guard';
import { createNewLink } from '~/server/services/link.service';
import { createAPIResponse } from '~/server/utils/server-utils';
import { newLinkValidation } from '~/server/validation/link.validation';

export default defineEventHandler({
  onRequest: [authGuard],
  async handler(event) {
    const data = await readValidatedBody(event, newLinkValidation.parse);
    const result = await createNewLink(event.context.user.id, data);

    return createAPIResponse(result);
  },
});
