import { basename } from 'path'

const layerName = basename(__dirname)

export default defineNuxtConfig({
  components: {
    dirs: [
      {
        path: './components',
        prefix: layerName,
        global: true // Makes them available globally
      }
    ]
  },
  extends: [
    './collections/events',
    './collections/products',
    './collections/orders',
    './collections/locations',
    './collections/categories',
    './collections/clients',
    './collections/orderproducts',
    './collections/printers',
    './collections/printqueues',
    './collections/printerlocations',
    './collections/systemlogs'
  ]
})
