import { authGuard } from '~/server/guards/auth.guard';
import { newLinkValidation } from '~/server/validation/link.validation';

export default defineEventHandler({
  onRequest: [authGuard],
  async handler(event) {
    const body = await readValidatedBody(event, (data) =>
      newLinkValidation.parse(data),
    );
    return body;
  },
});
