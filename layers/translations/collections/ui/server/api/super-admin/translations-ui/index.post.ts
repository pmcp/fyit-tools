import { createTranslationsUi } from '../../../database/queries'

export default defineEventHandler(async (event) => {
  // Check if user is super admin
  const { user } = await requireUserSession(event)
  if (!user.superAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Super admin access required',
    })
  }

  const body = await readBody(event)

  // Validate required fields
  if (!body.keyPath || !body.category || !body.values) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: keyPath, category, values',
    })
  }

  // Validate values has at least the default language (English)
  if (!body.values.en) {
    throw createError({
      statusCode: 400,
      statusMessage: 'English translation is required',
    })
  }

  // Create new translation (system level - no teamId)
  const newTranslation = {
    userId: user.id,
    teamId: undefined, // System-level translation (null in database)
    namespace: 'ui',
    keyPath: body.keyPath,
    category: body.category,
    values: body.values,
    description: body.description || undefined,
    isOverrideable: body.isOverrideable !== undefined ? body.isOverrideable : true,
  }

  try {
    return await createTranslationsUi(newTranslation)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    if (errorMessage.includes('UNIQUE constraint failed')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'A translation with this keyPath and namespace already exists',
      })
    }
    throw error
  }
})