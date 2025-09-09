export default {
  // Path to your JSON schema file
  schemaPath: './Scaffolder/schemas/products.json',

  // Database dialect: 'pg' or 'sqlite'
  dialect: 'sqlite',

  // Target layers and collections to generate
  targets: [
    {
      layer: 'shop',           // Layer name (will create layers/shop/collections/...)
      collections: ['products', 'somethingElse'] // Collection names to generate
    },
    {
      layer: 'yassss',           // Layer name (will create layers/shop/collections/...)
      collections: ['nopeeees'] // Collection names to generate
    }
  ],

  // Optional flags
  flags: {
    useMetadata: true,        // Include metadata fields (createdAt, updatedAt)
    autoRelations: false,     // Generate relation stubs in comments
    retries: 0
  }
}
