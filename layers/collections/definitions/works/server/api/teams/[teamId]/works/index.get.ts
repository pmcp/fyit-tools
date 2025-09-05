import { getAllWorks, getWorksByIds } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'

export default defineEventHandler(async (event) => {
  const { teamId } = getRouterParams(event)
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
    return await getWorksByIds(teamId, ids)
  }
  
  return await getAllWorks(teamId)
})