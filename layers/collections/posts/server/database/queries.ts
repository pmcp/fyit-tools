import type { InsertPost, Post } from '@@/types/database'
import { H3Error } from 'h3'

export const getAllPosts = async (teamId: string) => {
  try {
    const posts = await useDB().query.posts.findMany({
      where: and(eq(tables.posts.teamId, teamId)),
      orderBy: [desc(tables.posts.createdAt)],
      with: {
        userId: {
          columns: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    })
    return posts
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get all posts',
    })
  }
}

export const getPostsByIds = async (teamId: string, postIds: string[]) => {
  try {
    const posts = await useDB().query.posts.findMany({
      where: and(
        eq(tables.posts.teamId, teamId),
        inArray(tables.posts.id, postIds)
      ),
      orderBy: [desc(tables.posts.createdAt)],
      with: {
        userId: {
          columns: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    })
    return posts
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get posts by ids',
    })
  }
}

export const createPost = async (payload: InsertPost) => {
  try {
    const post = await useDB().insert(tables.posts).values(payload).returning()
    return post[0]
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create post',
    })
  }
}

export const updatePost = async (
  postId: string,
  teamId: string,
  userId: string,
  updates: Partial<Post>
) => {
  try {
    const post = await useDB()
      .update(tables.posts)
      .set(updates)
      .where(
        and(
          eq(tables.posts.id, postId),
          eq(tables.posts.teamId, teamId),
          eq(tables.posts.userId, userId)
        )
      )
      .returning()
    
    if (!post[0]) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found or unauthorized',
      })
    }
    
    return post[0]
  } catch (error) {
    if (error instanceof H3Error) throw error
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update post',
    })
  }
}

export const deletePost = async (postId: string, teamId: string, userId: string) => {
  try {
    const post = await useDB()
      .delete(tables.posts)
      .where(
        and(
          eq(tables.posts.id, postId),
          eq(tables.posts.teamId, teamId),
          eq(tables.posts.userId, userId)
        )
      )
      .returning()
    
    if (!post[0]) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found or unauthorized',
      })
    }
    
    return post[0]
  } catch (error) {
    if (error instanceof H3Error) throw error
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete post',
    })
  }
}