import { deletePosPrintQueue } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'

export default defineEventHandler(async (event) => {
  const { id: teamId, printqueueId } = getRouterParams(event)
  if (!teamId || typeof teamId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Team ID is required' })
  }
  if (!printqueueId || typeof printqueueId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Printqueue ID is required' })
  }
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  return await deletePosPrintQueue(printqueueId, teamId, user.id)
})