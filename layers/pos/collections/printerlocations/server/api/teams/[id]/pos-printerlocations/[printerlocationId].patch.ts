import { updatePosPrinterLocation } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { PosPrinterLocation } from '../../../../../../types'

export default defineEventHandler(async (event) => {
  const { id: teamId, printerlocationId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<Partial<PosPrinterLocation>>(event)
  
  return await updatePosPrinterLocation(printerlocationId, teamId, user.id, {
    printerId: body.printerId,
    locationId: body.locationId
  })
})