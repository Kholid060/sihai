import { findLinkByKey, redirectLink } from '~/server/services/link.service';
import { getTheRequestPath } from '~/server/utils/server-utils';

const BASE_PATH = '/api/redirect/';

export default defineEventHandler(async (event) => {
  const link = await findLinkByKey(getTheRequestPath(event, BASE_PATH.length));

  return await redirectLink(link, event);
});
