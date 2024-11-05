import { authGuard } from '~/server/guards/auth.guard';
import { queryTopLinks } from '~/server/services/analytics.service';
import { analyticsQueryValidation } from '~/server/validation/analytics.validation';

export default defineEventHandler({
  onRequest: [authGuard],
  async handler(event) {
    const query = await getValidatedEventData(
      event,
      'query',
      analyticsQueryValidation.pick({ interval: true, linkId: true }),
    );
    return queryTopLinks({
      ...query,
      userId: event.context.user.id,
    });
  },
});
