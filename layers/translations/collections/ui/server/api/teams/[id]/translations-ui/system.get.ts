import { isTeamMember } from '@@/server/utils/teams'
import { getOverrideableSystemTranslations, getTeamBySlug } from '../../../../database/queries'

export default defineEventHandler(async (event) => {
  const teamSlug = getRouterParam(event, 'id')
  const { user } = await requireUserSession(event)

  // Verify team and access
  const team = await getTeamBySlug(teamSlug)

  const hasAccess = await isTeamMember(team.id, user.id)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized'
    })
  }

  return await getOverrideableSystemTranslations()
})
