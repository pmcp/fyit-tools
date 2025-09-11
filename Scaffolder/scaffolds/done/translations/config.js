export default {
  // Database dialect: 'pg' or 'sqlite'
  dialect: 'sqlite',

  // i18n configuration
  i18n: {
    locales: ['en', 'nl', 'fr'], // Priority languages
    defaultLocale: 'en',
    fallbackLocale: 'en'
  },

  // Translation configuration - no auto-translations for these collections
  translations: {
    collections: {}
  },

  // Collections to generate
  collections: [
    {
      name: 'systemTranslations',
      fieldsFile: 'Scaffolder/scaffolds/translations/system-translations.json'
    },
    {
      name: 'teamDomainSettings', 
      fieldsFile: 'Scaffolder/scaffolds/translations/team-domain-settings.json'
    }
  ],

  // Target layers and collections to generate
  targets: [
    {
      layer: 'translations',
      collections: [
        'systemTranslations',
        'teamDomainSettings'
      ]
    }
  ],

  // Optional flags
  flags: {
    useMetadata: true,        // Include metadata fields (createdAt, updatedAt)
    autoRelations: false,     // Don't generate relation stubs
    retries: 0
  }
};