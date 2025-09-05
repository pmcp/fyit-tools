import { createWork } from '../../../../database/queries'
import { isTeamMember } from '../../../../../../../../../server/database/queries/teams'

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
  
  const body = await readBody(event)
  
  return await createWork({ ...body, teamId, userId: user.id })
})