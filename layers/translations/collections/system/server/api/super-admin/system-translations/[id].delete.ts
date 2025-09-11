import { translationsSystemtranslations } from '../../../database/schema'
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

  const result = await useDrizzle()
    .delete(translationsSystemtranslations)
    .where(eq(translationsSystemtranslations.id, id))
    .run()

  if (result.changes === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Translation not found',
    })
  }

  return { success: true }
})