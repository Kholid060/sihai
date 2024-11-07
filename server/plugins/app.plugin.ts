import { findLinkByKey, redirectLink } from '../services/link.service';

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', async (event) => {
    const host = getRequestHost(event);
    if (
      host.startsWith('app.') ||
      host === '/' ||
      host === '/__nuxt_error' ||
      host.startsWith('/api/')
    )
      return;

    const link = await findLinkByKey(event.path.slice(1));
    return await redirectLink(link, event);
  });
});
