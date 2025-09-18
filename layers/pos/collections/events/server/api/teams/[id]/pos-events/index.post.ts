import { createPosEvent } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { CreatePosEventInput } from '../../../../../types'

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

  const body = await readBody<CreatePosEventInput>(event)

  // Validate required fields
  if (!body.name) {
    throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  }

  // Exclude id field to let the database generate it
  const { id, locale, ...dataWithoutId } = body

  // Structure translations for initial creation
  if (locale && dataWithoutId.translations) {
    dataWithoutId.translations = {
      [locale]: dataWithoutId.translations[locale] || {}
    }
  }

  return await createPosEvent({
    name: body.name!,
    slug: dataWithoutId.slug,
    description: dataWithoutId.description,
    eventType: dataWithoutId.eventType,
    status: dataWithoutId.status,
    startDate: dataWithoutId.startDate,
    endDate: dataWithoutId.endDate,
    isActive: dataWithoutId.isActive,
    isCurrent: dataWithoutId.isCurrent,
    archivedAt: dataWithoutId.archivedAt,
    parentEventId: dataWithoutId.parentEventId,
    metadata: dataWithoutId.metadata,
    translations: dataWithoutId.translations,
    teamId,
    userId: user.id
  })
})