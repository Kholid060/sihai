import { updateLink } from '~/server/services/link.service';
import { updateLinkValidation } from '~/server/validation/link.validation';

export default defineAPIEventHandler(async (event) => {
  const payload = await getValidatedEventData(
    event,
    'body',
    updateLinkValidation,
  );
  await updateLink(
    event.context.drizzle,
    event.context.user.id,
    getRouterParam(event, 'linkId')!,
    payload,
  );

  return createAPIResponse(null);
});
