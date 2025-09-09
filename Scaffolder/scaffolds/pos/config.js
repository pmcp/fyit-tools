export default {
  // Database dialect: 'pg' or 'sqlite'
  dialect: 'sqlite',

  // i18n configuration
  i18n: {
    locales: ['en', 'nl', 'fr'], // Priority languages
    defaultLocale: 'en',
    fallbackLocale: 'en'
  },

  // Translation configuration
  translations: {
    // Collections that need translations
    collections: {
      products: ['name', 'description', 'remarkPrompt'],
      categories: ['name', 'description'],
      locations: ['name', 'description'],
      events: ['name', 'description', 'terms', 'conditions'],
      systemLogs: ['message', 'errorDescription', 'resolution'],
      clients: ['notes', 'description'],
      printers: ['name', 'statusMessage']
    }
  },

  // Collections to generate
  collections: [
    {
      name: 'events',
      fieldsFile: 'Scaffolder/scaffolds/pos/events.json'
    },
    {
      name: 'products',
      fieldsFile: 'Scaffolder/scaffolds/pos/products.json'
    },
    {
      name: 'orders',
      fieldsFile: 'Scaffolder/scaffolds/pos/orders.json'
    },
    {
      name: 'locations',
      fieldsFile: 'Scaffolder/scaffolds/pos/locations.json'
    },
    {
      name: 'categories',
      fieldsFile: 'Scaffolder/scaffolds/pos/categories.json'
    },
    {
      name: 'clients',
      fieldsFile: 'Scaffolder/scaffolds/pos/clients.json'
    },
    {
      name: 'orderProducts',
      fieldsFile: 'Scaffolder/scaffolds/pos/order-products.json'
    },
    {
      name: 'printers',
      fieldsFile: 'Scaffolder/scaffolds/pos/printers.json'
    },
    {
      name: 'printQueue',
      fieldsFile: 'Scaffolder/scaffolds/pos/print-queue.json'
    },
    {
      name: 'printerLocations',
      fieldsFile: 'Scaffolder/scaffolds/pos/printer-locations.json'
    },
    {
      name: 'systemLogs',
      fieldsFile: 'Scaffolder/scaffolds/pos/system-logs.json'
    }
  ],

  // Target layers and collections to generate
  targets: [
    {
      layer: 'pos',           // Layer name (will create layers/core/collections/...)
      collections: [
        'events',
        'products',
        'orders',
        'locations',
        'categories',
        'clients',
        'orderProducts',
        'printers',
        'printQueue',
        'printerLocations',
        'systemLogs'
      ]
    }
  ],

  // Optional flags
  flags: {
    useMetadata: true,        // Include metadata fields (createdAt, updatedAt)
    autoRelations: true,      // Generate relation stubs in comments
    retries: 0
  }
};
