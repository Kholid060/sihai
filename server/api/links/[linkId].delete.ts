import { authGuard } from '~/server/guards/auth.guard';
import { deleteLink } from '~/server/services/link.service';

export default defineEventHandler({
  onRequest: [authGuard],
  async handler(event) {
    await deleteLink(event.context.user.id, getRouterParam(event, 'linkId')!);
    return createAPIResponse(null);
  },
});
