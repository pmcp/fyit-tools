<template>
  <AppContainer :title="tString('pages.dashboard.posts')">
    <template #actions>
      <UButton :label="tString('buttons.newPost')" @click="openCreateModal()" />
    </template>
    <div>
      <div
        class="w-full columns-1 gap-3 space-y-3 md:columns-2 lg:columns-3 xl:columns-5"
      >
        <div
          v-for="post in posts"
          :key="post.id"
          class="break-inside-avoid-column rounded-2xl bg-neutral-100 dark:bg-neutral-950"
        >
          <div class="rounded-xl bg-[#fbfaf9] p-1.5 dark:bg-neutral-950">
            <div
              class="card-shadow group rounded-md bg-white dark:bg-neutral-900"
            >
              <header
                class="flex min-w-0 items-center gap-2 border-b border-neutral-100 px-4 py-2 dark:border-white/10"
              >
                <p
                  class="flex-1 truncate text-sm text-neutral-600 dark:text-neutral-400"
                >
                  {{ post.title }}
                </p>
                <div
                  class="flex opacity-10 transition-opacity group-hover:opacity-100"
                >
                  <UButton
                    icon="i-lucide-pencil"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    @click="openEditModal(post)"
                  />
                  <UButton
                    icon="i-lucide-trash"
                    color="error"
                    variant="ghost"
                    size="xs"
                    :loading="deletingPostId === post.id"
                    @click="confirmDelete(post.id)"
                  />
                </div>
              </header>
              <div class="px-4 py-6">
                <img
                  v-if="post.image"
                  :src="post.image"
                  class="mb-2 min-h-40 w-full rounded-md object-cover"
                  :alt="post.title"
                >
                <p
                  class="text-sm whitespace-pre-wrap text-neutral-500 dark:text-neutral-400"
                >
                  {{ post.content }}
                </p>
              </div>
              <footer
                class="flex min-w-0 items-center justify-between gap-2 border-t border-neutral-100 px-4 py-2 dark:border-white/10"
              >
                <div class="flex items-center gap-2">
                  <UAvatar v-if="post.userId.avatarUrl" :src="post.userId.avatarUrl" size="xs" />
                  <p class="text-xs font-medium text-neutral-500">
                    {{ post.userId.name }}
                  </p>
                </div>
                <p class="text-xs font-medium text-neutral-500">
                  {{ useDateFormat(post.createdAt, 'MMM DD hh:mm A') }}
                </p>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Post Modal (Create/Edit) -->
    <UModal
      v-model:open="postModal.isOpen"
      :title="postModal.isEdit ? tString('modals.editPost.title') : tString('modals.newPost.title')"
      :description="
        postModal.isEdit
          ? tString('messages.updatePost')
          : tString('messages.createNewPost')
      "
    >
      <template #body>
        <UForm
          :schema="schema"
          :state="state"
          class="space-y-4"
          @submit="handleSubmit"
        >
          <UFormField :label="tString('fields.image')" name="imagePath">
            <AppPostImageUploader
              v-model="state.image"
              @file-selected="handleFileSelected"
            />
          </UFormField>
          <UFormField :label="tString('fields.title')" name="title">
            <UInput v-model="state.title" class="w-full" size="xl" />
          </UFormField>

          <UFormField :label="tString('fields.content')" name="content">
            <UTextarea v-model="state.content" class="w-full" size="xl" />
          </UFormField>

          <UButton
            :label="postModal.isEdit ? tString('common.update') : tString('common.submit')"
            type="submit"
            :loading="loading"
          />
        </UForm>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="deleteModal.isOpen" :title="tString('modals.deletePost.title')">
      <template #body>
        <p class="mb-4">
          {{ tString('messages.confirmDeletePost') }}
        </p>
        <div class="flex justify-end gap-2">
          <UButton
:label="tString('common.cancel')"
            color="neutral"
            variant="outline"
            @click="deleteModal.isOpen = false"
          />
          <UButton
:label="tString('common.delete')"
            color="error"
            :loading="loading"
            @click="handleDeletePost"
          />
        </div>
      </template>
    </UModal>
  </AppContainer>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { Post, InsertPost, User } from '@@/types/database'
import type { FormSubmitEvent } from '@nuxt/ui'

// Extended Post type with populated user data
type PostWithUser = Omit<Post, 'userId'> & {
  userId: User
}

const { currentTeam } = useTeam()
const { tString } = useT()
const toast = useToast()
const loading = ref(false)
const deletingPostId = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

const postModal = reactive({
  isOpen: false,
  isEdit: false,
  editId: null as string | null,
})

const deleteModal = reactive({
  isOpen: false,
  postId: null as string | null,
})

const state = reactive<Partial<Schema>>({
  title: undefined,
  content: undefined,
  image: undefined,
})

const schema = z.object({
  title: z
    .string()
    .min(1, tString('validation.titleRequired'))
    .max(100, tString('validation.titleMaxLength')),
  content: z
    .string()
    .min(1, tString('validation.contentRequired'))
    .max(1000, tString('validation.contentMaxLength')),
  image: z.string().optional(),
})

type Schema = z.output<typeof schema>

const { data: posts, refresh } = await useFetch<PostWithUser[]>(
  `/api/teams/${currentTeam.value.id}/posts`,
  {
    watch: [currentTeam],
    default: () => [],
  },
)

const uploadImage = async () => {
  try {
    if (!selectedFile.value) return ''
    const formData = new FormData()
    formData.append('image', selectedFile.value)
    const filePath = await $fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    })
    return `/images/${filePath}`
  } catch (error: any) {
    console.log(error)
    toast.add({
      title: tString('errors.failedToUploadImage'),
      description:
        error.data?.message || tString('errors.failedToUploadImage'),
      color: 'error',
    })
    throw createError('Failed to upload image')
  }
}

const createPost = async (post: Partial<InsertPost>) => {
  try {
    const { data, error } = await useFetch(
      `/api/teams/${currentTeam.value.id}/posts`,
      {
        method: 'POST',
        body: post,
      },
    )

    if (error.value) {
      throw error.value
    }

    return data.value
  } catch (error: any) {
    toast.add({
      title: tString('errors.failedToCreatePost'),
      description:
        error.data?.message || tString('errors.failedToCreatePost'),
      color: 'error',
    })
    throw error
  }
}

const updatePost = async (id: string, post: Partial<Post>) => {
  try {
    const updatedPost = await $fetch<Post>(
      `/api/teams/${currentTeam.value.id}/posts/${id}`,
      {
        method: 'PATCH',
        body: post,
      },
    )
    return updatedPost
  } catch (error: any) {
    toast.add({
      title: tString('errors.failedToUpdatePost'),
      description:
        error.data?.message || tString('errors.failedToUpdatePost'),
      color: 'error',
    })
    throw error
  }
}

const deletePost = async (id: string) => {
  try {
    deletingPostId.value = id
    return await $fetch<Post>(
      `/api/teams/${currentTeam.value.id}/posts/${id}`,
      {
        method: 'DELETE',
      },
    )
  } catch (error: any) {
    toast.add({
      title: tString('errors.failedToDeletePost'),
      description:
        error.data?.message || tString('errors.failedToDeletePost'),
      color: 'error',
    })
    throw error
  } finally {
    deletingPostId.value = null
  }
}

const resetForm = () => {
  state.title = undefined
  state.content = undefined
  state.image = undefined
  selectedFile.value = null
}

const openCreateModal = () => {
  resetForm()
  postModal.isEdit = false
  postModal.editId = null
  postModal.isOpen = true
}

const openEditModal = (post: Omit<PostWithUser, 'createdAt' | 'updatedAt'>) => {
  resetForm()
  state.title = post.title
  state.content = post.content
  state.image = post.image || undefined
  postModal.isEdit = true
  postModal.editId = post.id
  postModal.isOpen = true
}

const confirmDelete = (postId: string) => {
  deleteModal.postId = postId
  deleteModal.isOpen = true
}

const handleFileSelected = (file: File | null) => {
  selectedFile.value = file
  if (!file) {
    state.image = undefined
  }
}

const handleSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    loading.value = true
    let image = state.image

    if (selectedFile.value) {
      image = await uploadImage()
    }

    const payload = {
      ...event.data,
      image,
    }

    if (postModal.isEdit && postModal.editId) {
      await updatePost(postModal.editId, payload)
      toast.add({
        title: tString('toast.postUpdated.title'),
        description: tString('toast.postUpdated.description'),
        color: 'success',
      })
    } else {
      await createPost(payload)
      toast.add({
        title: tString('toast.postCreated.title'),
        description: tString('toast.postCreated.description'),
        color: 'success',
      })
    }
    await refresh()
    postModal.isOpen = false
    resetForm()
  } catch (error) {
    console.error('Error submitting post:', error)
  } finally {
    loading.value = false
  }
}

const handleDeletePost = async () => {
  if (!deleteModal.postId) return

  try {
    loading.value = true
    await deletePost(deleteModal.postId)
    if (posts.value) {
      posts.value = posts.value.filter((post) => post.id !== deleteModal.postId)
    }

    toast.add({
      title: tString('toast.postDeleted.title'),
      description: tString('toast.postDeleted.description'),
      color: 'success',
    })
    deleteModal.isOpen = false
    deleteModal.postId = null
  } catch (error) {
    console.error('Error deleting post:', error)
  } finally {
    loading.value = false
  }
}
</script>
