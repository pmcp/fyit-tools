import { translationsSystem } from '../../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // Check if user is super admin
  const { user } = await requireUserSession(event)
  if (!user.superAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Super admin access required',
    })
  }

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  // Validate values if provided
  if (body.values) {
    if (!body.values.en || !body.values.nl || !body.values.fr) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Values must include en, nl, and fr translations',
      })
    }
  }

  // Update translation
  const updateData = {
    ...(body.values && { values: body.values }),
    ...(body.description !== undefined && { description: body.description }),
    updatedAt: new Date(),
  }

  const result = await useDrizzle()
    .update(translationsSystem)
    .set(updateData)
    .where(eq(translationsSystem.id, id))
    .run()

  if (result.changes === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Translation not found',
    })
  }

  // Return updated translation
  const updated = await useDrizzle()
    .select()
    .from(translationsSystem)
    .where(eq(translationsSystem.id, id))
    .get()

  return updated
})