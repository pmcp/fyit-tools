import { updateItem } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { Item } from '../../../../../../types'

export default defineEventHandler(async (event) => {
  const { id: teamId, itemId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<Partial<Item>>(event)
  return await updateItem(itemId, teamId, user.id, {
    id: body.id,
    name: body.name,
    price: body.price,
    inStock: body.inStock
  })
})