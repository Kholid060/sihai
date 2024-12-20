// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@nuxt/eslint',
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    'nuxt-security',
    '@nuxt/image',
    '@nuxthub/core',
    '@nuxtjs/robots',
  ],
  security: {
    headers: {
      contentSecurityPolicy: {
        'img-src': 'self data: *',
      },
    },
  },
  devtools: { enabled: true },
  runtimeConfig: {
    dbURL: process.env.DATABASE_URL,
    public: {
      appDomain: process.env.APP_DOMAIN,
    },
  },
  compatibilityDate: '2024-04-03',
  vite: {
    optimizeDeps: {
      exclude: ['vee-validate'],
    },
  },
  shadcn: {
    prefix: 'Ui',
  },
  supabase: {
    redirectOptions: {
      login: '/auth/login',
      include: ['/dashboard(/*)?'],
      callback: '/auth/redirect',
    },
  },
  tailwindcss: {
    configPath: 'tailwind.config.ts',
  },
});
