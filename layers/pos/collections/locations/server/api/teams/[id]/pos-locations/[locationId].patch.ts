import { updatePosLocation, getPosLocationsByIds } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { PosLocation } from '../../../../../../types'

export default defineEventHandler(async (event) => {
  const { id: teamId, locationId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<Partial<PosLocation>>(event)
  
  // Handle translation updates properly
  if (body.translations && body.locale) {
    const [existing] = await getPosLocationsByIds(teamId, [locationId])
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
  
  return await updatePosLocation(locationId, teamId, user.id, {
    eventId: body.eventId,
    name: body.name,
    description: body.description,
    isActive: body.isActive,
    printerMode: body.printerMode,
    maxRetryAttempts: body.maxRetryAttempts
  })
})