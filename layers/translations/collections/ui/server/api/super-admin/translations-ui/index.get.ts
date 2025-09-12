import { getAllSystemTranslationsWithOverrideCounts } from '../../../database/queries'

export default defineEventHandler(async (event) => {
  // Check if user is super admin
  const { user } = await requireUserSession(event)
  if (!user.superAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Super admin access required',
    })
  }

  // Fetch all system translations with override counts
  return await getAllSystemTranslationsWithOverrideCounts()
})