import { updatePosPrintQueue } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { PosPrintQueue } from '../../../../../types'

type PatchBody = Partial<PosPrintQueue>
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

  const body = await readBody<PatchBody>(event)
  
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