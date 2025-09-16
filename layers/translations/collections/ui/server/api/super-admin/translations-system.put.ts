import {
  getSystemTranslationByKeyPath,
  updateTranslationsUi,
  createTranslationsUi
} from '../../database/queries'

export default defineEventHandler(async (event) => {
  const { keyPath, values, category = 'ui', createIfNotExists = false, description } = await readBody(event)

  if (!keyPath || !values) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    })
  }

  try {
    // For dev mode, we'll allow editing without strict auth check
    // In production, you'd want to add proper super-admin auth here
    const { user } = await getUserSession(event).catch(() => ({ user: null }))

    // Check if system translation exists
    const existing = await getSystemTranslationByKeyPath(keyPath, category)

    if (existing) {
      // Update existing system translation
      return await updateTranslationsUi(existing.id, {
        values,
        updatedAt: new Date(),
        ...(description && { description })
      })
    } else if (createIfNotExists) {
      // Create new system translation
      const newTranslation = await createTranslationsUi({
        teamId: null, // System translation
        keyPath,
        category,
        namespace: category,
        values,
        userId: user?.id || 'dev-mode-edit',
        description: description || `Auto-created via dev mode editing for key: ${keyPath}`,
        isOverrideable: true
      })

      return newTranslation
    } else {
      throw createError({
        statusCode: 404,
        statusMessage: 'Translation not found and createIfNotExists is false'
      })
    }
  } catch (error: any) {
    console.error('Failed to save system translation:', error)

    // Handle duplicate key errors
    if (error.message?.includes('UNIQUE constraint failed')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'System translation already exists'
      })
    }

    // Re-throw if it's already a createError
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save translation'
    })
  }
})