import { isTeamMember } from '@@/server/utils/teams'
import { getTeamBySlug, resolveTranslation } from '../../../../database/queries'

export default defineEventHandler(async (event) => {
  const teamSlug = getRouterParam(event, 'id') // This is actually the slug from the URL
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
  const keyPath = query.keyPath as string
  const namespace = (query.namespace as string) || 'ui'
  const locale = (query.locale as string) || 'en'

  if (!keyPath) {
    throw createError({
      statusCode: 400,
      statusMessage: 'keyPath parameter is required',
    })
  }

  // Use the existing resolveTranslation function
  const result = await resolveTranslation(team.id, keyPath, namespace, locale)

  // Format the response to match the expected output
  return {
    source: result.source,
    keyPath,
    namespace,
    locale,
    value: result.value,
    translation: result.translation,
    ...(result.translation?.isOverrideable !== undefined && { isOverrideable: result.translation.isOverrideable })
  }
})