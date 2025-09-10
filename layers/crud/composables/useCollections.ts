/**
 * useCollections Composable
 * 
 * This composable auto-discovers and manages all collection configurations
 * across the entire application. It creates a centralized registry of all
 * collections with their configurations, reactive state, and component mappings.
 * 
 * Flow: Import Files → Extract Configs → Create State → Provide Interface
 */

// ============================================================================
// STEP 1: AUTO-DISCOVERY - Find all collection files
// ============================================================================

// Dynamically import all collection composable files from every layer
// This uses Vite's glob import to scan the filesystem at build time
// Path pattern: ../../[layer]/collections/[collection]/app/composables/use[Collection].ts
// Example: ../../pos/collections/products/app/composables/usePosProducts.ts
const modules = import.meta.glob('../../*/collections/**/app/composables/use*.ts', { eager: true })

// ============================================================================
// STEP 2: HELPER FUNCTIONS - Pure functions for data transformation
// ============================================================================

/**
 * Check if a module export is a valid collection config
 * A valid config must:
 * 1. Have a key ending with 'Config' (e.g., 'posProductsConfig')
 * 2. Be an object
 * 3. Have a 'name' property (used as the collection identifier)
 */
const isValidConfig = ([key, value]: [string, any]): boolean =>
  key.endsWith('Config') && 
  value && 
  typeof value === 'object' && 
  'name' in value

/**
 * Extract the config object from a module's exports
 * Searches through all exports to find the one that matches our config pattern
 */
const extractConfig = (module: any) =>
  Object.entries(module).find(isValidConfig)

/**
 * Parse a file path to extract layer and collection names
 * Example input: '../../pos/collections/products/app/composables/usePosProducts.ts'
 * Example output: { layerName: 'pos', collectionName: 'products' }
 * Returns null if the path doesn't match our expected pattern
 */
const parseModulePath = (path: string) => {
  const parts = path.split('/')
  const collectionsIndex = parts.indexOf('collections')
  
  // Validate that we have a proper collections path
  return collectionsIndex !== -1 && collectionsIndex + 1 < parts.length
    ? { layerName: parts[2], collectionName: parts[collectionsIndex + 1] }
    : null
}

/**
 * Transform a module entry (path + module) into a config object
 * This combines path parsing and config extraction
 * Returns { [configName]: configObject } or null if invalid
 */
const moduleToConfig = ([path, module]: [string, any]): Record<string, any> | null => {
  const pathInfo = parseModulePath(path)
  const configEntry = pathInfo && extractConfig(module)
  
  // If we found a valid config, return it keyed by its name
  return configEntry ? { [configEntry[1].name]: configEntry[1] } : null
}

/**
 * Create a reactive state container for a collection
 * Each collection gets its own useState hook to store its data
 * This allows components to reactively update when collection data changes
 */
const createCollectionState = (name: string) =>
  useState(name, () => [])

/**
 * Extract component name mapping from a config
 * This is used to dynamically render the correct form component
 * for each collection type in the UI
 */
const configToComponentMapping = ([key, config]: [string, any]) =>
  ({ [key]: config.componentName })

// ============================================================================
// STEP 3: BUILD COLLECTION REGISTRY - Process all discovered modules
// ============================================================================

// Transform all imported modules into a single configuration object
// Pipeline: modules → extract configs → filter nulls → merge into single object
const collectionConfigs = Object.entries(modules)
  .map(moduleToConfig)           // Transform each module to config
  .filter(Boolean)                // Remove null entries
  .reduce((acc, config) => ({ ...acc, ...config }), {} as Record<string, any>) || {}

// ============================================================================
// STEP 4: MAIN COMPOSABLE - Combine everything into a useful interface
// ============================================================================

/**
 * Main composable function that provides collection management
 * 
 * Returns:
 * - Individual collection states (e.g., posProducts, posEvents)
 * - componentMap: Maps collection names to their form components
 * - getConfig: Function to retrieve a specific collection's configuration
 * - configs: Raw configuration data for all collections
 */
export default function () {
  // Create reactive state containers for all discovered collections
  // Each collection can store its data independently
  const collections = Object.keys(collectionConfigs || {})
    .map(name => ({ [name]: createCollectionState(name) }))
    .reduce((acc, state) => ({ ...acc, ...state }), {})

  // Build a map of collection names to their component names
  // Used by the UI to dynamically render the correct form for each collection
  const componentMap = Object.entries(collectionConfigs || {})
    .map(configToComponentMapping)
    .reduce((acc, mapping) => ({ ...acc, ...mapping }), {})

  // Helper function to get a specific collection's configuration
  // Returns undefined if the collection doesn't exist
  const getConfig = (name: string) => 
    collectionConfigs ? collectionConfigs[name] : undefined

  return {
    ...collections,             // Spread all individual collection states
    componentMap,               // Collection → Component name mappings
    getConfig,                  // Config getter function
    configs: collectionConfigs  // Raw configuration data
  }
}