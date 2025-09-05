import { getAllTasks, getTasksByIds, getTasksByStatus } from '../../../../database/queries'
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
  
  // Filter by status if provided
  if (query.status && typeof query.status === 'string') {
    return await getTasksByStatus(teamId, query.status)
  }
  
  // Get specific tasks by IDs
  const ids = query.ids
  if (ids) {
    const taskIds = Array.isArray(ids)
      ? ids.map(String)
      : typeof ids === 'string'
        ? ids.split(',')
        : [String(ids)]
    return await getTasksByIds(teamId, taskIds)
  }

  // Get all tasks
  return await getAllTasks(teamId)
})