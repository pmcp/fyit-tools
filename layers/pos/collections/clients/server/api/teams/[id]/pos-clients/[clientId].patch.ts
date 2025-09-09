import { updatePosClient, getPosClientsByIds } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { PosClient } from '../../../../../../types'

export default defineEventHandler(async (event) => {
  const { id: teamId, clientId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<Partial<PosClient>>(event)
  
  // Handle translation updates properly
  if (body.translations && body.locale) {
    const [existing] = await getPosClientsByIds(teamId, [clientId])
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
  
  return await updatePosClient(clientId, teamId, user.id, {
    eventId: body.eventId,
    name: body.name,
    email: body.email,
    notes: body.notes,
    active: body.active,
    description: body.description,
    isGlobal: body.isGlobal,
    translations: body.translations
  })
})