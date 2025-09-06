import { getAllTest1s, getTest1sByIds } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'

export default defineEventHandler(async (event) => {
  const { id: teamId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized Access',
    })
  }

  const query = getQuery(event)

  if (query.ids) {
    const ids = String(query.ids).split(',')
    return await getTest1sByIds(teamId, ids)
  }

  return await getAllTest1s(teamId)
})