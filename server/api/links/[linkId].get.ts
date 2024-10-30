import { authGuard } from '~/server/guards/auth.guard';
import { findLinkByUserAndId } from '~/server/services/link.service';

export default defineEventHandler({
  onRequest: [authGuard],
  async handler(event) {
    const result = await findLinkByUserAndId(
      event.context.user.id,
      getRouterParam(event, 'linkId')!,
    );
    return createAPIResponse(result);
  },
});
