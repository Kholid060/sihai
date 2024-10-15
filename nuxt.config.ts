// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', 'shadcn-nuxt', '@nuxt/eslint'],
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  shadcn: {
    prefix: 'Ui',
  },
  tailwindcss: {
    configPath: 'tailwind.config.ts',
  },
});
