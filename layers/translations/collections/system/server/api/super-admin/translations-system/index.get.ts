import { translationsSystem } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  // Check if user is super admin
  const { user } = await requireUserSession(event)
  if (!user.superAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Super admin access required',
    })
  }

  // Fetch all system translations
  const translations = await useDrizzle()
    .select()
    .from(translationsSystem)
    .all()

  return translations
})