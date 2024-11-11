import { useDrizzle } from '../lib/drizzle';
import { findLinkByKey, redirectLink } from '../services/link.service';

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', async (event) => {
    const { host, pathname } = getRequestURL(event);
    if (
      host.startsWith('app.') ||
      host === '/' ||
      host === '/__nuxt_error' ||
      host.startsWith('/api/')
    )
      return;

    const drizzle = useDrizzle();

    const link = await findLinkByKey(drizzle, pathname.slice(1));

    return await redirectLink(drizzle, link, event);
  });
});
