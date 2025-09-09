export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'en', name: 'English' },
      { code: 'nl', name: 'Nederlands' },
      { code: 'fr', name: 'Français' }
    ],
    defaultLocale: 'en'
  }
})