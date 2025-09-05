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
  // TODO
  const { currentTeam } = useTeam()

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


  // useState
  const showCrud = useState('showCrud', () => false)
  const loading = useState('loading', () => 'notLoading')
  const action = useState('action', () => null)
  const activeCollection = useState('activeCollection', () => null)
  const items = useState('items', () => [])
  const activeItem = useState('activeItem', () => {})

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

    // Get collections reference before async operations
    const collections = useCollections();
    const collectionRef = collections[collection];

    try {
      // Use $fetch for API calls with proper error handling
      const res = await $fetch(`/api/${collection}`, {
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

    // Get collections reference
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
    loading.value = `${action}_send`

    // Get collections reference before async operations
    const collections = useCollections();
    const collectionRef = collections[collection as keyof typeof collections] as any;

    const optimisticItem = optimisticUpdate(action, collection, data)

    try {
      let res;
      const baseUrl = `/api/teams/${currentTeam.value.id}/${collection}`

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

      // Close after successful operation
      close()

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
      loading.value = 'notLoading'

    }
  }

  const open = async (actionIn: string, collection: string, ids: string[]): Promise<void> => {
    if(useCrudError().foundErrors()) return;

    action.value = actionIn
    activeCollection.value = collection

    loading.value = `${actionIn}_open`
    showCrud.value = true

    if (actionIn === 'update') {
      try {
        // Use $fetch for API calls with proper error handling
        const response = await $fetch(`/api/teams/${currentTeam.value.id}/${collection}/`, {
          method: 'GET',
          query: { ids: ids.join(',') }
        });

        // For update, we expect a single item - store it in activeItem
        activeItem.value = Array.isArray(response) ? response[0] : response
      } catch (error) {
        toast.add({
          title: 'Uh oh! Something went wrong.',
          description: String(error),
          icon: 'i-lucide-octagon-alert',
          color: 'primary'
        })
        close();
        return;
      }
    }

    if(actionIn === 'create') {
      // For create, start with empty activeItem
      activeItem.value = {}
    }

    if(actionIn === 'delete') {
      // For delete, store IDs in items array
      items.value = ids
    }

    loading.value = 'notLoading'
  }





  const close = (): void => {
    // Set showCrud first - this is the single source of truth
    showCrud.value = false
    // Then reset all other state
    loading.value = 'notLoading'
    items.value = []
    action.value = null
    activeCollection.value = null
    activeItem.value = {}
  }

  // Reset function for navigation scenarios
  const reset = (): void => {
    showCrud.value = false
    loading.value = 'notLoading'
    items.value = []
    action.value = null
    activeCollection.value = null
    activeItem.value = {}
  }

  return {
    pagination,
    showCrud,
    loading,
    action,
    items,
    activeItem,
    activeCollection,
    send,
    open,
    close,
    reset,
    getCollection
  }

}
