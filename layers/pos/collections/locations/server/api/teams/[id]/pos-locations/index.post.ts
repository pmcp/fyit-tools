import { createPosLocation } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { CreatePosLocationInput } from '../../../../../types'

export default defineEventHandler(async (event) => {
  const { id: teamId } = getRouterParams(event)
  if (!teamId || typeof teamId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Team ID is required' })
  }
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<CreatePosLocationInput>(event)

  // Validate required fields
  if (!body.name) {
    throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  }
  if (body.eventId === undefined || body.eventId === null) {
    throw createError({ statusCode: 400, statusMessage: 'Event ID is required' })
  }

  // Exclude id field to let the database generate it
  const { id, locale, ...dataWithoutId } = body

  // Structure translations for initial creation
  if (locale && dataWithoutId.translations) {
    dataWithoutId.translations = {
      [locale]: dataWithoutId.translations[locale] || {}
    }
  }

  return await createPosLocation({
    name: body.name!,
    eventId: body.eventId,
    description: dataWithoutId.description,
    isActive: dataWithoutId.isActive,
    printerMode: dataWithoutId.printerMode,
    maxRetryAttempts: dataWithoutId.maxRetryAttempts,
    translations: dataWithoutId.translations,
    teamId,
    userId: user.id
  })
})