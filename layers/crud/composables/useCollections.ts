// Auto-discover all collection configs from all layers
const modules = import.meta.glob('../../*/collections/**/app/composables/use*.ts', { eager: true })

// Build collection configs from discovered modules
const collectionConfigs = Object.entries(modules).reduce((configs, [path, module]) => {
  // Extract layer and collection name from path
  // Pattern: '../../layerName/collections/collectionName/app/composables/useCollectionName.ts'
  const pathParts = path.split('/')
  const layerName = pathParts[2] // Get layer name
  const collectionsIndex = pathParts.indexOf('collections')
  
  if (collectionsIndex !== -1 && collectionsIndex + 1 < pathParts.length) {
    const collectionName = pathParts[collectionsIndex + 1]
    
    // Instead of trying to guess the config name, find it dynamically
    // Look for any export that ends with 'Config' and has a 'name' property
    const moduleExports = Object.entries(module as any)
    const configEntry = moduleExports.find(([key, value]) => {
      return key.endsWith('Config') && 
             value && 
             typeof value === 'object' && 
             'name' in value
    })
    
    if (configEntry) {
      const [configName, config] = configEntry
      configs[config.name] = config
    }
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