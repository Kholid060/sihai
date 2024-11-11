import { getAnalyticsByClicks } from '~/server/services/analytics.service';
import { analyticsQueryValidation } from '~/server/validation/analytics.validation';

export default defineAPIEventHandler(async (event) => {
  const query = await getValidatedEventData(
    event,
    'query',
    analyticsQueryValidation.pick({ interval: true, linkId: true }),
  );
  return getAnalyticsByClicks(event.context.drizzle, {
    ...query,
    userId: event.context.user.id,
  });
});
