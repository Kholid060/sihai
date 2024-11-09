import { destroyDrizzle } from '../lib/drizzle';
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

    const link = await findLinkByKey(pathname.slice(1));
    return await redirectLink(link, event);
  });
  nitroApp.hooks.hook('beforeResponse', (event) => {
    if (
      event.path.startsWith('/api/') ||
      import.meta.dev ||
      process.env.PLATFORM !== 'cloudflare'
    )
      return;

    event.waitUntil(destroyDrizzle());
  });
});
