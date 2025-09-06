import { updateTest3 } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { Test3 } from '../../../../../../types'

export default defineEventHandler(async (event) => {
  const { id: teamId, test3Id } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized Access',
    })
  }

  const body = await readBody<Partial<Test3>>(event)

  return await updateTest3(test3Id, teamId, user.id, {
    name: body.name,
    description: body.description
  })
})