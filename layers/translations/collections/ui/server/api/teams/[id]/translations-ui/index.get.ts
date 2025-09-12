import { and, eq, or, isNull } from 'drizzle-orm'
import { isTeamMember } from '@@/server/utils/teams'

export default defineEventHandler(async (event) => {
  const { id: teamId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  
  // Check if user has access to this team
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized - you are not a member of this team'
    })
  }

  const query = getQuery(event)
  const locale = query.locale as string | undefined

  const db = useDB()
  
  // Fetch team translations and overrideable system translations
  const translations = await db
    .select()
    .from(tables.translationsUi)
    .where(
      or(
        eq(tables.translationsUi.teamId, teamId),
        and(
          isNull(tables.translationsUi.teamId),
          eq(tables.translationsUi.isOverrideable, true)
        )
      )
    )
    .orderBy(desc(tables.translationsUi.createdAt))

  // Filter by locale if provided
  if (locale) {
    return translations.filter(t => t.values && locale in t.values)
  }

  return translations
})