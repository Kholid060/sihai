import { getAnalyticsData } from '~/server/services/analytics.service';
import { analyticsQueryValidation } from '~/server/validation/analytics.validation';

export default defineAPIEventHandler(async (event) => {
  const query = await getValidatedEventData(
    event,
    'query',
    analyticsQueryValidation,
  );
  return getAnalyticsData(event.context.drizzle, event.context.user.id, query);
});
