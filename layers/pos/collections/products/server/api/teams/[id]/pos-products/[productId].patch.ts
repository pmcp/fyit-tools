import { updatePosProduct } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { PosProduct } from '../../../../../../types'

export default defineEventHandler(async (event) => {
  const { id: teamId, productId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<Partial<PosProduct>>(event)
  return await updatePosProduct(productId, teamId, user.id, {
    eventId: body.eventId,
    categoryId: body.categoryId,
    locationId: body.locationId,
    name: body.name,
    description: body.description,
    price: body.price,
    isActive: body.isActive,
    isTemplate: body.isTemplate,
    requiresRemark: body.requiresRemark,
    remarkPrompt: body.remarkPrompt,
    sortOrder: body.sortOrder
  })
})