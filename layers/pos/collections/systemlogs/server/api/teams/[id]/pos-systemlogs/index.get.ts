import { getAllPosSystemLogs, getPosSystemLogsByIds } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'

export default defineEventHandler(async (event) => {
  const { id: teamId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const query = getQuery(event)
  if (query.ids) {
    const ids = String(query.ids).split(',')
    return await getPosSystemLogsByIds(teamId, ids)
  }
  
  return await getAllPosSystemLogs(teamId)
})