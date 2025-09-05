// Auto-discover all collection configs using glob import
const modules = import.meta.glob('../*/app/composables/use*.ts', { eager: true })

// Build collection configs from discovered modules
const collectionConfigs = Object.entries(modules).reduce((configs, [path, module]) => {
  // Extract collection name from path (e.g., '../posts/composables/usePosts.ts' -> 'posts')
  const collectionName = path.split('/')[1]
  
  // Try to find the config in the module
  // First check for named export matching pattern
  const configName = `${collectionName}Config`
  const config = (module as any)[configName]
  
  if (config && config.name) {
    configs[config.name] = config
  }
  
  return configs
}, {} as Record<string, any>)

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
