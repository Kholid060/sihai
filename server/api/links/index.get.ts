import { authGuard } from '~/server/guards/auth.guard';
import { createAPIResponse } from '~/server/utils/server-utils';

export default defineEventHandler({
  onRequest: [authGuard],
  async handler() {
    return createAPIResponse({});
  },
});
