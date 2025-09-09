import { updatePosPrinter, getPosPrintersByIds } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { PosPrinter } from '../../../../../../types'

export default defineEventHandler(async (event) => {
  const { id: teamId, printerId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<Partial<PosPrinter>>(event)
  
  // Handle translation updates properly
  if (body.translations && body.locale) {
    const [existing] = await getPosPrintersByIds(teamId, [printerId])
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
  
  return await updatePosPrinter(printerId, teamId, user.id, {
    eventId: body.eventId,
    name: body.name,
    ipAddress: body.ipAddress,
    port: body.port,
    status: body.status,
    showPrices: body.showPrices,
    locationId: body.locationId,
    priority: body.priority,
    healthStatus: body.healthStatus,
    lastSuccessAt: body.lastSuccessAt,
    lastFailureAt: body.lastFailureAt,
    consecutiveFailures: body.consecutiveFailures,
    translations: body.translations
  })
})