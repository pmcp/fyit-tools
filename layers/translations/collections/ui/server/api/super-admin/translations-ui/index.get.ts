import { getAllSystemTranslationsWithOverrideCounts } from '../../../database/queries'
import { eq, and, isNull } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // Check if user is super admin
  const { user } = await requireUserSession(event)
  if (!user.superAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Super admin access required',
    })
  }

  const query = getQuery(event)
  const keyPath = query.keyPath as string | undefined

  // If keyPath is provided, fetch specific translation
  if (keyPath) {
    const db = useDB()
    const translations = await db
      .select()
      .from(tables.translationsUi)
      .where(
        and(
          eq(tables.translationsUi.keyPath, keyPath),
          isNull(tables.translationsUi.teamId)
        )
      )
    return translations
  }

  // Otherwise fetch all system translations with override counts
  return await getAllSystemTranslationsWithOverrideCounts()
})