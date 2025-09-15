import { and, eq, or, isNull } from 'drizzle-orm'
import { isTeamMember } from '@@/server/utils/teams'

export default defineEventHandler(async (event) => {
  const teamSlug = getRouterParam(event, 'id') // This is actually the slug from the URL
  const { user } = await requireUserSession(event)
  
  const db = useDB()
  
  // First, get the team by slug to get the actual team ID
  const team = await db
    .select()
    .from(tables.teams)
    .where(eq(tables.teams.slug, teamSlug))
    .get()
    
  if (!team) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Team not found'
    })
  }
  
  // Check if user has access to this team
  const hasAccess = await isTeamMember(team.id, user.id)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized - you are not a member of this team'
    })
  }

  const query = getQuery(event)
  const locale = query.locale as string | undefined
  
  // Fetch ONLY team-specific translations
  const translations = await db
    .select()
    .from(tables.translationsUi)
    .where(eq(tables.translationsUi.teamId, team.id))
    .orderBy(desc(tables.translationsUi.createdAt))

  // Filter by locale if provided
  if (locale) {
    return translations.filter(t => t.values && locale in t.values)
  }

  return translations
})