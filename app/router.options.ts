import type { RouterConfig } from '@nuxt/schema';

export default <RouterConfig>{
  routes(routes) {
    const url = useRequestURL();
    if (url.pathname === '/') {
      return routes.filter((route) => route.name === 'landing-page');
    }

    const [subdmain] = url.hostname.split('.');
    if (subdmain === 'app') return routes;

    return [];
  },
};
