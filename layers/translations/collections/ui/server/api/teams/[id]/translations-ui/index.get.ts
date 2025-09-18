import { isTeamMember } from '@@/server/utils/teams'
import { getTeamBySlug, getTeamTranslations } from '../../../../database/queries'

export default defineEventHandler(async (event) => {
  const teamSlug = getRouterParam(event, 'id') // This is actually the slug from the URL
  if (!teamSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Team slug is required',
    })
  }
  const { user } = await requireUserSession(event)

  // Get the team by slug
  const team = await getTeamBySlug(teamSlug)

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

  // Fetch team-specific translations
  const translations = await getTeamTranslations(team.id)

  // Filter by locale if provided
  if (locale) {
    return translations.filter(t => t.values && typeof t.values === 'object' && t.values !== null && locale in t.values)
  }

  return translations
})