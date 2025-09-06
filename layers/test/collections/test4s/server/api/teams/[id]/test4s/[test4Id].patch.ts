import { updateTest4 } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { Test4 } from '../../../../../../types'

export default defineEventHandler(async (event) => {
  const { id: teamId, test4Id } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized Access',
    })
  }

  const body = await readBody<Partial<Test4>>(event)

  return await updateTest4(test4Id, teamId, user.id, {
    name: body.name,
    description: body.description
  })
})