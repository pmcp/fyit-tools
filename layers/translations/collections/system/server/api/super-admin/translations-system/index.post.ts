import { createTranslationsSystem } from '../../../database/queries'

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

  // Validate values has all required languages
  if (!body.values.en || !body.values.nl || !body.values.fr) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Values must include en, nl, and fr translations',
    })
  }

  // Create new translation
  const newTranslation = {
    userId: user.id,
    keyPath: body.keyPath,
    category: body.category,
    values: body.values,
    description: body.description || null,
  }

  try {
    return await createTranslationsSystem(newTranslation)
  } catch (error) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'A translation with this keyPath already exists',
      })
    }
    throw error
  }
})