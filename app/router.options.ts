import type { RouterConfig } from '@nuxt/schema';

export default <RouterConfig>{
  routes(routes) {
    const url = useRequestURL();
    if (url.pathname === '/') {
      return routes.filter((route) => route.name === 'landing-page');
    }

    if (url.hostname.startsWith('app.')) return routes;

    return routes.filter((route) => route.name === 'redirect-link');
  },
};
