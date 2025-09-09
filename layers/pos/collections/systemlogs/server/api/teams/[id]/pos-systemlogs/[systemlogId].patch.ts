import { updatePosSystemLog } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { PosSystemLog } from '../../../../../../types'

export default defineEventHandler(async (event) => {
  const { id: teamId, systemlogId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<Partial<PosSystemLog>>(event)
  
  return await updatePosSystemLog(systemlogId, teamId, user.id, {
    logType: body.logType,
    message: body.message,
    metadata: body.metadata,
    eventId: body.eventId
  })
})