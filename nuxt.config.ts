// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    'shadcn-nuxt',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    'nuxt-mongoose',
    'nuxt-auth-utils',
    'nuxt-api-shield'
  ],

  nuxtApiShield: {
    limit: {
      max: 12,
      duration: 108,
      ban: 3600,
    },
    delayOnBan: true,
    errorMessage: "Too Many Requests",
    retryAfterHeader: false,
    log: {
      path: "logs",
      attempts: 100,
    },
    routes: ["/api/auth/login"],
  },



  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '@/components/ui'
  }
})