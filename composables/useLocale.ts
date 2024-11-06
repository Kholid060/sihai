export const useDefaultLocale = (_fallback = 'en-US') => {
  return { value: 'en-US' };
  // const locale = ref(fallback);

  // if (import.meta.server) {
  //   const reqLocale = useRequestHeaders()['accept-language']?.split(',')[0];
  //   if (reqLocale) locale.value = reqLocale;
  // } else if (import.meta.client) {
  //   const navLang = navigator.language;
  //   if (navLang) locale.value = navLang;
  // }

  // return locale;
};
