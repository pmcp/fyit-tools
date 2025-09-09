import { updatePosEvent, getPosEventsByIds } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { PosEvent } from '../../../../../../types'

export default defineEventHandler(async (event) => {
  const { id: teamId, eventId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<Partial<PosEvent>>(event)
  
  // Handle translation updates properly
  if (body.translations && body.locale) {
    const [existing] = await getPosEventsByIds(teamId, [eventId])
    if (existing) {
      body.translations = {
        ...existing.translations,
        [body.locale]: {
          ...existing.translations?.[body.locale],
          ...body.translations[body.locale]
        }
      }
    }
  }
  
  return await updatePosEvent(eventId, teamId, user.id, {
    name: body.name,
    slug: body.slug,
    description: body.description,
    eventType: body.eventType,
    status: body.status,
    startDate: body.startDate,
    endDate: body.endDate,
    isActive: body.isActive,
    isCurrent: body.isCurrent,
    archivedAt: body.archivedAt,
    parentEventId: body.parentEventId,
    metadata: body.metadata,
    translations: body.translations
  })
})