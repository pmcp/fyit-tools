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
    './collections/posts',
    './collections/works',
    './collections/events',
    './collections/test1s',
    './collections/test2s',
    './collections/test3s',
    './collections/test4s'
  ]
})
