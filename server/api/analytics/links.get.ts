import { queryTopLinks } from '~/server/services/analytics.service';
import { defineAPIEventHandler } from '~/server/utils/defineAPIEventHandler';
import { analyticsQueryValidation } from '~/server/validation/analytics.validation';

export default defineAPIEventHandler(async (event) => {
  const query = await getValidatedEventData(
    event,
    'query',
    analyticsQueryValidation.pick({ interval: true, linkId: true }),
  );
  return queryTopLinks(event.context.drizzle, {
    ...query,
    userId: event.context.user.id,
  });
});
