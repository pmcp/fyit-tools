// Generator for nuxt.config.ts

export function generateNuxtConfig(data) {
  const { pascalCasePlural, layerPascalCase } = data

  return `import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const currentDir = fileURLToPath(new URL('.', import.meta.url))

export default defineNuxtConfig({
  components: {
    dirs: [
      {
        path: join(currentDir, 'app/components'),
        prefix: '${layerPascalCase}${pascalCasePlural}',
        global: true
      }
    ]
  }
})`
}