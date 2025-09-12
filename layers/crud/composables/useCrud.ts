import {
  applyOptimisticCreate,
  applyOptimisticUpdate,
  applyOptimisticDelete,
  replaceByOptimisticId,
  rollbackCreate,
  apiGet,
  apiPost,
  apiPatch,
  apiDelete
} from '../utils/functional';


export default function () {
  const toast = useToast()
  const route = useRoute()
  // TODO
  const { currentTeam } = useTeam()
  
  // Helper function to get the correct API base path
  const getApiBasePath = (apiPath: string) => {
    // Check if we're in super-admin context
    if (route.path.includes('/super-admin/')) {
      return `/api/super-admin/${apiPath}`
    }
    // Default to team-based path
    return `/api/teams/${currentTeam.value.id}/${apiPath}`
  }

  const pagination = useState('pagination', () => {
    return {
      locations: {
        currentPage: 1,
        pageSize: 100,
        totalItems: 0,
        totalPages: 0
      }
    }
  })


  // useState - now using array of states for multiple slideovers
  const crudStates = useState('crudStates', () => [])
  const MAX_DEPTH = 5 // Maximum nesting depth
  
  // Computed values for backward compatibility
  const showCrud = computed(() => crudStates.value.length > 0)
  const loading = computed(() => crudStates.value[crudStates.value.length - 1]?.loading || 'notLoading')
  const action = computed(() => crudStates.value[crudStates.value.length - 1]?.action || null)
  const activeCollection = computed(() => crudStates.value[crudStates.value.length - 1]?.collection || null)
  const items = computed(() => crudStates.value[crudStates.value.length - 1]?.items || [])
  const activeItem = computed(() => crudStates.value[crudStates.value.length - 1]?.activeItem || {})

  // Simple vars - removed unused actions object

  // Functions

  // Create a composable function for fetch calls
  const createFetchable = (collection, options = {}) => {
    return useFetch(`/api/${collection}`, {
      key: `${collection}-${Date.now()}`, // Unique key for each call
      ...options
    })
  }


  async function getCollection(collection: string, query: any, pagination: boolean) {
    if(useCrudError().foundErrors()) return;

    if (pagination) query.pagination = useUserSettings().pagination.value[collection]

    const { handleApiError } = useApiErrorHandler();

    // Get test reference before async operations
    const collections = useCollections();
    const collectionRef = collections[collection];

    try {
      // Get the correct API path based on context
      const collections = useCollections();
      const config = collections.getConfig(collection)
      const apiPath = config?.apiPath || collection
      const fullApiPath = route.path.includes('/super-admin/') 
        ? `/api/super-admin/${apiPath}`
        : `/api/${collection}`
      
      // Use $fetch for API calls with proper error handling
      const res = await $fetch(fullApiPath, {
        method: 'GET',
        query: query,
        credentials: 'include'
      })

      // Set collection with received items only when fetching a full collection
      if(res && res.items && collectionRef) {
        collectionRef.value = res.items
      }

      // TODO: Fix Set pagination for collection
      if(pagination) useUserSettings().pagination.value[collection] = res.pagination

      return res;
    } catch (error) {
      handleApiError(error, `fetching ${collection}`);

      // Set empty collection on error to prevent UI issues
      if (collectionRef) {
        collectionRef.value = [];
      }

      return null;
    }
  }


  // Pure functional optimistic update
  function optimisticUpdate(action: string, collection: string, data: any): any {

    // Get test reference
    const collections = useCollections();
    const collectionItems = collections[collection]
    if (!collectionItems) return null

    // Apply the appropriate optimistic transformation
    if (action === 'delete') {
      const { collection: newCollection, deletedIds } = applyOptimisticDelete(
        collectionItems.value,
        data // data is array of ids for delete
      )
      collectionItems.value = newCollection

      // Clear selected rows
      const selectedRows = useState('selectedRows')
      selectedRows.value = []

      return deletedIds
    }

    if (action === 'create') {
      const { collection: newCollection, optimisticItem } = applyOptimisticCreate(
        collectionItems.value,
        data
      )
      collectionItems.value = newCollection
      return optimisticItem
    }

    if (action === 'update') {
      const { collection: newCollection, optimisticItem } = applyOptimisticUpdate(
        collectionItems.value,
        data.id,
        data
      )

      if (optimisticItem) {
        collectionItems.value = newCollection
        activeItem.value = optimisticItem
      }

      return optimisticItem
    }

    return null
  }

  async function send(action: string, collection: string, data: any): Promise<any> {
    if(useCrudError().foundErrors()) return;
    
    // Find the state that initiated this send
    const currentState = crudStates.value[crudStates.value.length - 1]
    if (!currentState) return;
    
    currentState.loading = `${action}_send`
    
    // Get test reference before async operations
    const collections = useCollections();
    const collectionRef = collections[collection as keyof typeof collections] as any;
    
    // Get the apiPath from config, fallback to collection name
    const config = collections.getConfig(collection)
    const apiPath = config?.apiPath || collection

    const optimisticItem = optimisticUpdate(action, collection, data)

    try {
      let res;
      // Use the correct API base path based on context
      const baseUrl = getApiBasePath(apiPath)

      // Use functional API helpers
      if (action === 'update') {
        // Send the entire data object, not just specific fields
        res = await apiPatch(`${baseUrl}/${data.id}`)(data)
      }

      if (action === 'create') {
        res = await apiPost(baseUrl)(data)
      }

      if (action === 'delete') {
        // For delete, we need to delete each item individually
        // since the API expects DELETE /api/teams/[teamId]/posts/[postId]
        const deletePromises = data.map((id: string) =>
          apiDelete(`${baseUrl}/${id}`)()
        )
        res = await Promise.all(deletePromises)
      }


      if(action === 'create' || action === 'update') {
        // Use functional helper to replace optimistic item with server response
        if (optimisticItem && optimisticItem.optimisticId) {
          collectionRef.value = replaceByOptimisticId(
            collectionRef.value,
            optimisticItem.optimisticId,
            res
          )
        }
      }

      // Show success toast only when operation succeeds
      // For users collection, show more specific message
      if (collection === 'users' && action === 'create') {
        const wasExistingUser = optimisticItem.isExistingUser;
        if (wasExistingUser) {
          toast.add({
            title: 'User added to organisation successfully'
          });
        } else {
          toast.add({
            title: 'User created and added to organisation'
          });
        }
      } else {
        toast.add(
          {
            title: 'Succes!',
            description: `${useFormatCollections().collectionWithCapitalSingular(collection)} ${action}d`,
            icon: 'i-lucide-check',
            color: 'primary'
          })

      }

      // Close the current state after successful operation
      close(currentState?.id)

      // Return the response for the caller to use
      return res

    } catch (error) {
      const errorMessage = error.data?.message || error.data || 'Operation failed';
      toast.add({
        title: 'Uh oh! Something went wrong.',
        description: errorMessage,
        icon: 'i-lucide-octagon-alert',
        color: 'primary'
      })


      // Rollback optimistic update using functional helpers
      if(action === 'create' && optimisticItem?.optimisticId) {
        collectionRef.value = rollbackCreate(collectionRef.value, optimisticItem.optimisticId)
      } else if(action === 'update' && optimisticItem) {
        // For update rollback, remove the optimistic flags
        const index = collectionRef.value.findIndex((item: any) => item.id === optimisticItem.id)
        if(index !== -1) {
          // Remove optimistic flags but keep the item
          const cleanItem = { ...collectionRef.value[index] }
          delete cleanItem.optimisticAction
          delete cleanItem.optimisticId
          collectionRef.value[index] = cleanItem
        }
      } else if(action === 'delete') {
        // For delete rollback, we would need to restore the items
        // Since we don't store them, we'd need to refetch
        // This is a known limitation that's acceptable for now
      }

      // Keep the modal open on error so user can retry
      if (currentState) {
        currentState.loading = 'notLoading'
      }

    }
  }

  const open = async (actionIn: string, collection: string, ids: string[]): Promise<void> => {
    if(useCrudError().foundErrors()) return;

    // Check if we've reached maximum depth
    if (crudStates.value.length >= MAX_DEPTH) {
      const toast = useToast()
      toast.add({
        title: 'Maximum depth reached',
        description: 'Cannot open more than 5 nested forms',
        icon: 'i-lucide-octagon-alert',
        color: 'primary'
      })
      return;
    }

    // Create new state object
    const newState = {
      id: `crud-${Date.now()}-${Math.random()}`, // Unique ID for Vue key
      action: actionIn,
      collection: collection,
      activeItem: {},
      items: [],
      loading: `${actionIn}_open` as any,
      isOpen: true
    }

    // Add new state to array
    crudStates.value.push(newState)

    if (actionIn === 'update') {
      try {
        // Get the apiPath from config, fallback to collection name
        const collections = useCollections()
        const config = collections.getConfig(collection)
        const apiPath = config?.apiPath || collection
        
        // Use the correct API base path based on context
        const fullApiPath = getApiBasePath(apiPath)
        
        // Use $fetch for API calls with proper error handling
        const response = await $fetch(fullApiPath, {
          method: 'GET',
          query: { ids: ids.join(',') }
        });

        // For update, we expect a single item - store it in the state
        const activeItem = Array.isArray(response) ? response[0] : response
        
        // Find the state index and update it reactively
        const stateIndex = crudStates.value.findIndex(s => s.id === newState.id)
        if (stateIndex !== -1) {
          crudStates.value[stateIndex] = {
            ...crudStates.value[stateIndex],
            activeItem: activeItem,
            loading: 'notLoading'
          }
        }
        return; // Exit early since we've already set loading to notLoading
      } catch (error) {
        toast.add({
          title: 'Uh oh! Something went wrong.',
          description: String(error),
          icon: 'i-lucide-octagon-alert',
          color: 'primary'
        })
        // Remove the state we just added
        crudStates.value.pop();
        return;
      }
    }

    if(actionIn === 'create') {
      // For create, start with empty activeItem
      newState.activeItem = {}
    }

    if(actionIn === 'delete') {
      // For delete, store IDs in items array
      newState.items = ids
    }

    // Only set loading to notLoading for non-update actions
    if (actionIn !== 'update') {
      newState.loading = 'notLoading'
    }
  }





  const close = (stateId?: string): void => {
    if (stateId) {
      // Close specific state by ID
      const index = crudStates.value.findIndex(s => s.id === stateId)
      if (index !== -1) {
        crudStates.value.splice(index, 1)
      }
    } else {
      // Close the topmost state (backward compatibility)
      crudStates.value.pop()
    }
  }
  
  // New function to close all states
  const closeAll = (): void => {
    crudStates.value = []
  }

  // Reset function for navigation scenarios
  const reset = (): void => {
    crudStates.value = []
  }

  return {
    pagination,
    showCrud,
    loading,
    action,
    items,
    activeItem,
    activeCollection,
    crudStates,
    send,
    open,
    close,
    closeAll,
    reset,
    getCollection
  }

}
