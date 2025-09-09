import { updatePosPrintQueue } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { PosPrintQueue } from '../../../../../../types'

export default defineEventHandler(async (event) => {
  const { id: teamId, printqueueId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<Partial<PosPrintQueue>>(event)
  
  return await updatePosPrintQueue(printqueueId, teamId, user.id, {
    orderId: body.orderId,
    locationId: body.locationId,
    printerId: body.printerId,
    status: body.status,
    items: body.items,
    total: body.total,
    printMode: body.printMode,
    isDuplicateOf: body.isDuplicateOf,
    startedAt: body.startedAt,
    completedAt: body.completedAt,
    errorMessage: body.errorMessage,
    retryCount: body.retryCount,
    eventId: body.eventId,
    printData: body.printData
  })
})