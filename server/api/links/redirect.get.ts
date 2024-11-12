import { linkRedirectQueryValidation } from '~/server/validation/link.validation';
import { findLinkByKey, redirectLink } from '../../services/link.service';

export default defineAPIEventHandler(
  async (event) => {
    const query = await getValidatedEventData(
      event,
      'query',
      linkRedirectQueryValidation,
    );
    const link = await findLinkByKey(event.context.drizzle, query.linkId);
    const redirectURL = await redirectLink(event.context.drizzle, link, event);

    return redirectURL;
  },
  { authGuard: false },
);
