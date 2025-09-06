import { updateEvent } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { Event } from '../../../../../../types'

export default defineEventHandler(async (event) => {
  const { id: teamId, eventId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized Access',
    })
  }
  
  const body = await readBody<Partial<Event>>(event)
  
  return await updateEvent(eventId, teamId, user.id, {
    name: body.name,
    description: body.description,
    date: body.date,
    location: body.location
  })
})