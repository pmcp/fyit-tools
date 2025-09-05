import { nanoid } from "nanoid";
import type {Post} from "~~/types/database";
import {updatePost} from "~~/server/database/queries/posts";


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

  // Simple vars
  const actions = {
    create: 'POST',
    update: 'POST',
    delete: 'DELETE',
  }

  // Functions

  // Create a composable function for fetch calls
  const createFetchable = (collection, options = {}) => {
    return useFetch(`/api/${collection}`, {
      key: `${collection}-${Date.now()}`, // Unique key for each call
      ...options
    })
  }


  async function getCollection(collection, query, pagination) {
    console.log(`GETTING COLLECTION ${collection} AND PAGINATION IS ${pagination}, QUERY = `, query)
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

      console.log(`RESPONSE FOR GETTING COLLECTION ${collection}:`, res)
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


  // This updates the DOM before the API call is made
  async function optimisticUpdate(action, collection, data) {
    console.log(`FUNCTION: optimisticUpdate -- DOING ${action} IN COLLECTION ${collection} FOR ITEM`, data)

    const itemToUpdate = { ... data, optimisticId: nanoid(10), optimisticAction: action }

    // Get collections reference before any async operations
    const collections = useCollections();
    const collectionItems = collections[collection]
    console.log(collectionItems)

    // DELETE (Data is an array of ids)
    if(action === 'delete') {
      collectionItems.value = collectionItems.value.filter(item => !data.includes(item.id));
      // Empty "selectedRows" array (in table component)
      const selectedRows = useState('selectedRows')
      selectedRows.value = []
      return data
    }

    // CREATE -- Data is an object, the item to create, add an optimistId
    if(action === 'create') {
      collectionItems.value.push(itemToUpdate);
      console.log(itemToUpdate, collectionItems);
      return itemToUpdate;
    }
    // UPDATE -- Check if the item is in the collection array
    if(action === 'update') {
      console.log(itemToUpdate, collectionItems.value);
      console.log(items, collectionItems.value.findIndex(item => item.id === itemToUpdate.id));
      collectionItems.value[collectionItems.value.findIndex(item => item.id === itemToUpdate.id)] = itemToUpdate
      return itemToUpdate
    }
  }

  async function send(action, collection, data) {
    console.log(`DOING ACTION ${action} ON COLLECTION ${collection}`, data)
    if(useCrudError().foundErrors()) return;
    loading.value = `${action}_send`

    // Get collections reference before async operations
    const collections = useCollections();
    const collectionRef = collections[collection];

    const optimisticItem = await optimisticUpdate(action, collection, data)
    console.log(data.id)

    try {

      let res;

     if(action === 'update') {

       console.log(actions[action])
       res = await $fetch(
          `/api/teams/${currentTeam.value.id}/${collection}/${data.id}`,
          {
            method: 'PATCH',
            body: data
          },
        )
     }

     if(action === 'create') {
       res = await $fetch(
         `/api/teams/${currentTeam.value.id}/${collection}/`,
         {
           method: actions[action],
           body: optimisticItem,
         },
       )
     }


      if(action === 'create' || action === 'update') {
        const index = collectionRef.value.findIndex(item => (item.optimisticId === optimisticItem.optimisticId))
        console.log(collectionRef.value, index)
        if(index !== -1) collectionRef.value[collectionRef.value.findIndex(item => (item.optimisticId === optimisticItem.optimisticId))] = { ...res }
      }

      // Show success toast only when operation succeeds
      // For users collection, show more specific message
      if (collection === 'users' && action === 'create') {
        const wasExistingUser = optimisticItem.isExistingUser;
        if (wasExistingUser) {
          toast.add('User added to organisation successfully');
        } else {
          toast.success('User created and added to organisation');
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
      // Show error message
      console.log(error)
      const errorMessage = error.data?.message || error.data || 'Operation failed';
      toast.add({
        title: 'Uh oh! Something went wrong.',
        description: errorMessage,
        icon: 'i-lucide-octagon-alert',
        color: 'error'
      })


      // Rollback optimistic update
      const collectionItems = collectionRef

      if(action === 'create') {
        // Remove the optimistically added item
        collectionItems.value = collectionItems.value.filter(item => item.optimisticId !== optimisticItem.optimisticId);
      } else if(action === 'update') {
        // For update, we'd need the original item to restore - this is a limitation
        // For now, just remove the optimistic flag
        const index = collectionItems.value.findIndex(item => item.id === optimisticItem.id)
        if(index !== -1) {
          delete collectionItems.value[index].optimisticAction
        }
      } else if(action === 'delete') {
        // Re-add the deleted items
        if(Array.isArray(data)) {
          // For delete, data is an array of IDs - we need to refetch to restore
          // This is a limitation without storing the original items
        }
      }

      console.log('ERROR', error)

      // Keep the modal open on error so user can retry
      loading.value = 'notLoading'

    }
  }

  const open = async (actionIn, collection, ids) => {
    console.log('OPENING CRUD', `DOING ${actionIn} ON ${collection}`, `IDS: ${ids}`)
    if(useCrudError().foundErrors()) return;

    action.value = actionIn
    activeCollection.value = collection

    loading.value = `${actionIn}_open`
    showCrud.value = true

    if (actionIn === 'update') {
      try {
        // Use $fetch for API calls with proper error handling
        const item = await $fetch(`/api/teams/${currentTeam.value.id}/${collection}/`, {
          method: 'GET',
          query: { ids: ids.join(',') }
        });

        items.value = [...items.value, ...item]
      } catch (error) {
        toast.add({
          title: 'Uh oh! Something went wrong.',
          description: error,
          icon: 'i-lucide-octagon-alert',
          color: 'error'
        })
        close();
        return;
      }
    }

    if(actionIn === 'delete') items.value = ids


    loading.value = 'notLoading'
  }





  const close = () => {
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
  const reset = () => {
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
