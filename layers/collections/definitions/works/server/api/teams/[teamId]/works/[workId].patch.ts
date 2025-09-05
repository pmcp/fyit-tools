import { updateWork } from '../../../../database/queries'
import { isTeamMember } from '../../../../../../../../../server/database/queries/teams'

export default defineEventHandler(async (event) => {
  const { teamId, workId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized Access',
    })
  }
  
  const body = await readBody(event)
  
  return await updateWork(workId, teamId, user.id, body)
})