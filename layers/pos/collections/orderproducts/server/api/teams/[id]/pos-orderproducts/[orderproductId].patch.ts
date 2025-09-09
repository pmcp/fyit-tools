import { updatePosOrderProduct } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { PosOrderProduct } from '../../../../../../types'

export default defineEventHandler(async (event) => {
  const { id: teamId, orderproductId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<Partial<PosOrderProduct>>(event)
  
  return await updatePosOrderProduct(orderproductId, teamId, user.id, {
    orderId: body.orderId,
    productId: body.productId,
    quantity: body.quantity,
    unitPrice: body.unitPrice,
    taxRate: body.taxRate,
    discountAmount: body.discountAmount,
    totalAmount: body.totalAmount,
    notes: body.notes,
    totalPrice: body.totalPrice,
    remarks: body.remarks
  })
})