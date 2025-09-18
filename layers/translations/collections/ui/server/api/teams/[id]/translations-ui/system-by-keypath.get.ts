import { isTeamMember } from '@@/server/utils/teams'
import { getTeamBySlug, getSystemTranslationByKeyPath } from '../../../../database/queries'

export default defineEventHandler(async (event) => {
  const teamSlug = getRouterParam(event, 'id')
  if (!teamSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Team slug is required',
    })
  }
  const { user } = await requireUserSession(event)
  const query = getQuery(event)
  const keyPath = query.keyPath as string | undefined

  if (!keyPath) {
    throw createError({
      statusCode: 400,
      statusMessage: 'keyPath query parameter is required'
    })
  }

  // Verify team and access
  const team = await getTeamBySlug(teamSlug)

  const hasAccess = await isTeamMember(team.id, user.id)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized'
    })
  }

  // Fetch the specific system translation
  const translation = await getSystemTranslationByKeyPath(keyPath)

  if (!translation) {
    throw createError({
      statusCode: 404,
      statusMessage: 'System translation not found'
    })
  }

  return translation
})