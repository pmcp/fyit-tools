import { postsConfig } from '../posts/composables/usePosts'

// Collection registry using functional approach
const collectionConfigs = {
  posts: postsConfig,
  // Add more collections here as they're created
} as const

// Create reactive state for each collection
const createCollectionState = (name: string) => 
  useState(name, () => [])

// Build component map from configs
const buildComponentMap = (configs: typeof collectionConfigs) =>
  Object.entries(configs).reduce((map, [key, config]) => ({
    ...map,
    [key]: config.componentName
  }), {} as Record<string, string>)

export default function () {
  // Create state for each registered collection
  const collections = Object.keys(collectionConfigs).reduce((acc, name) => ({
    ...acc,
    [name]: createCollectionState(name)
  }), {} as Record<string, ReturnType<typeof createCollectionState>>)

  // Generate component map from configs
  const componentMap = buildComponentMap(collectionConfigs)

  // Get config for a specific collection
  const getConfig = (name: string) => 
    collectionConfigs[name as keyof typeof collectionConfigs]

  return {
    ...collections,
    componentMap,
    getConfig,
    configs: collectionConfigs
  }
}
