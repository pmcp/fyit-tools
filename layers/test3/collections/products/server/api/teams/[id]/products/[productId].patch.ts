import { updateProduct } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { Product } from '../../../../../../types'

export default defineEventHandler(async (event) => {
  const { id: teamId, productId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized Access',
    })
  }

  const body = await readBody<Partial<Product>>(event)

  return await updateProduct(productId, teamId, user.id, {
    name: body.name,
    description: body.description
  })
})