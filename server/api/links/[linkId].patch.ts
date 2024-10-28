import { authGuard } from '~/server/guards/auth.guard';
import { updateLink } from '~/server/services/link.service';
import { updateLinkValidation } from '~/server/validation/link.validation';

export default defineEventHandler({
  onRequest: [authGuard],
  async handler(event) {
    const payload = await getValidatedEventData(
      event,
      'body',
      updateLinkValidation,
    );
    await updateLink(
      event.context.user.id,
      getRouterParam(event, 'linkId')!,
      payload,
    );

    return createAPIResponse(null);
  },
});
