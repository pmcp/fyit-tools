import { collectionRegistry, type CollectionName } from '../registry/collections'

// Import only the configs that actually exist
import {
  translationsUiConfig,
  posSystemLogsConfig,
  posProductsConfig,
  posPrintQueuesConfig,
  posPrintersConfig,
  posPrinterLocationsConfig,
  posOrdersConfig,
  posOrderProductsConfig,
  posLocationsConfig,
  posEventsConfig,
  posClientsConfig,
  posCategoriesConfig
} from '#imports'

/**
 * Simplified collection management using explicit registry with #imports
 */
export default function useCollections() {
  // Pre-loaded configs map - only include collections that have configs
  const configsMap = {
    translationsUi: translationsUiConfig,
    // teamTranslations doesn't have a config export - it's a special case
    posSystemLogs: posSystemLogsConfig,
    posProducts: posProductsConfig,
    posPrintQueues: posPrintQueuesConfig,
    posPrinters: posPrintersConfig,
    posPrinterLocations: posPrinterLocationsConfig,
    posOrders: posOrdersConfig,
    posOrderProducts: posOrderProductsConfig,
    posLocations: posLocationsConfig,
    posEvents: posEventsConfig,
    posClients: posClientsConfig,
    posCategories: posCategoriesConfig,
  }

  // Build component map from configs
  const componentMap = reactive<Record<string, string>>({})
  Object.entries(configsMap).forEach(([name, config]) => {
    if (config?.componentName) {
      componentMap[name] = config.componentName
    }
  })

  // Create reactive state for each collection
  const collections = Object.keys(collectionRegistry).reduce((acc, name) => {
    acc[name as CollectionName] = useState(name, () => [])
    return acc
  }, {} as Record<CollectionName, Ref<any[]>>)

  // Get config synchronously - returns undefined for collections without configs
  const getConfig = (name: string) => {
    return configsMap[name]
  }

  return {
    ...collections,
    componentMap,
    getConfig,
    configs: configsMap
  }
}