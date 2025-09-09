export default {
  // Database dialect: 'pg' or 'sqlite'
  dialect: 'sqlite',

  // Collections to generate
  collections: [
    {
      name: 'events',
      fieldsFile: 'Scaffolder/pos/events.json'
    },
    {
      name: 'products',
      fieldsFile: 'Scaffolder/pos/products.json'
    },
    {
      name: 'orders',
      fieldsFile: 'Scaffolder/pos/orders.json'
    },
    {
      name: 'locations',
      fieldsFile: 'Scaffolder/pos/locations.json'
    },
    {
      name: 'categories',
      fieldsFile: 'Scaffolder/pos/categories.json'
    },
    {
      name: 'clients',
      fieldsFile: 'Scaffolder/pos/clients.json'
    },
    {
      name: 'orderProducts',
      fieldsFile: 'Scaffolder/pos/order-products.json'
    },
    {
      name: 'printers',
      fieldsFile: 'Scaffolder/pos/printers.json'
    },
    {
      name: 'printQueue',
      fieldsFile: 'Scaffolder/pos/print-queue.json'
    },
    {
      name: 'printerLocations',
      fieldsFile: 'Scaffolder/pos/printer-locations.json'
    },
    {
      name: 'systemLogs',
      fieldsFile: 'Scaffolder/pos/system-logs.json'
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
