import { isNull, desc } from 'drizzle-orm'
import { getAllTranslationsUi } from '../../../database/queries'

export default defineEventHandler(async (event) => {
  // Check if user is super admin
  const { user } = await requireUserSession(event)
  if (!user.superAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Super admin access required',
    })
  }

  // Fetch all app translations (system-level only, teamId=null)
  const db = useDB()
  const translations = await db
    .select()
    .from(tables.translationsUi)
    .where(isNull(tables.translationsUi.teamId))
    .orderBy(desc(tables.translationsUi.createdAt))
  
  return translations
})