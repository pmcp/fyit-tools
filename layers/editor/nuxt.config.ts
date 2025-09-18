import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  // Nuxt Tiptap Editor module
  modules: ['nuxt-tiptap-editor'],
  tiptap: {
    prefix: 'Tiptap'
  },

  // Layer configuration
  extends: [],

  // CSS files for this layer
  // css: [
  //   join(currentDir, './app/assets/css/tiptap-editor.css')
  // ],

  // Auto-import components from this layer
  components: [
    {
      path: join(currentDir, './app/components'),
      pathPrefix: true,
      prefix: 'Editor'
    }
  ],

  // Auto-import composables
  imports: {
    dirs: [join(currentDir, './app/composables')]
  },

  // Set source directory
  srcDir: 'app/',

  // TypeScript configuration
  typescript: {
    typeCheck: true
  },

  // Development configuration
  devtools: { enabled: true }
})
