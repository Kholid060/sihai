import { authGuard } from '~/server/guards/auth.guard';
import { getAnalyticsByClicks } from '~/server/services/analytics.service';
import { analyticsQueryValidation } from '~/server/validation/analytics.validation';

export default defineEventHandler({
  onRequest: [authGuard],
  async handler(event) {
    const query = await getValidatedEventData(
      event,
      'query',
      analyticsQueryValidation.pick({ period: true }),
    );
    return getAnalyticsByClicks(event.context.user.id, query.period);
  },
});
