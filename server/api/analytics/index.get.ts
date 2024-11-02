import { authGuard } from '~/server/guards/auth.guard';
import { getAnalyticsData } from '~/server/services/analytics.service';
import { analyticsQueryValidation } from '~/server/validation/analytics.validation';

export default defineEventHandler({
  onRequest: [authGuard],
  async handler(event) {
    const query = await getValidatedEventData(
      event,
      'query',
      analyticsQueryValidation,
    );
    return getAnalyticsData(event.context.user.id, query);
  },
});
