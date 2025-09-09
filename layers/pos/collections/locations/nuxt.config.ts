import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const currentDir = fileURLToPath(new URL('.', import.meta.url))

export default defineNuxtConfig({
  components: {
    dirs: [
      {
        path: join(currentDir, 'app/components'),
        prefix: 'PosLocations',
        global: true
      }
    ]
  }
})