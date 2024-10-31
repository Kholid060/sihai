import { findLinkByKey, redirectLink } from '~/server/services/link.service';

const BASE_PATH = '/api/redirect/';

export default defineEventHandler(async (event) => {
  const urlKey = event.path.slice(BASE_PATH.length);
  const link = await findLinkByKey(urlKey);

  return await redirectLink(link, event);
});
