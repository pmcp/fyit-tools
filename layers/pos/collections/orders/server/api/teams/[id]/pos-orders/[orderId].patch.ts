import { updatePosOrder } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { PosOrder } from '../../../../../../types'

export default defineEventHandler(async (event) => {
  const { id: teamId, orderId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<Partial<PosOrder>>(event)
  return await updatePosOrder(orderId, teamId, user.id, {
    eventId: body.eventId,
    clientId: body.clientId,
    locationId: body.locationId,
    orderNumber: body.orderNumber,
    status: body.status,
    paymentMethod: body.paymentMethod,
    paymentStatus: body.paymentStatus,
    subtotal: body.subtotal,
    taxAmount: body.taxAmount,
    discountAmount: body.discountAmount,
    totalAmount: body.totalAmount,
    notes: body.notes,
    metadata: body.metadata,
    completedAt: body.completedAt,
    eventOrderNumber: body.eventOrderNumber,
    clientName: body.clientName,
    waiterId: body.waiterId,
    personnel: body.personnel,
    overallRemarks: body.overallRemarks
  })
})