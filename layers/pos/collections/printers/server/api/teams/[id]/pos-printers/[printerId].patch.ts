import { updatePosPrinter, getPosPrintersByIds } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { PosPrinter } from '../../../../../types'

type PatchBody = Partial<PosPrinter> & {
  translations?: Record<string, any>
  locale?: string
}
export default defineEventHandler(async (event) => {
  const { id: teamId, printerId } = getRouterParams(event)
  if (!teamId || typeof teamId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Team ID is required' })
  }
  if (!printerId || typeof printerId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Printer ID is required' })
  }
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<PatchBody>(event)
  
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