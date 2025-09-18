import { createPosProduct } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { CreatePosProductInput } from '../../../../../types'

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

  const body = await readBody<CreatePosProductInput>(event)

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

  return await createPosProduct({
    name: body.name!,
    eventId: body.eventId,
    categoryId: dataWithoutId.categoryId,
    locationId: dataWithoutId.locationId,
    description: dataWithoutId.description,
    price: dataWithoutId.price,
    isActive: dataWithoutId.isActive,
    isTemplate: dataWithoutId.isTemplate,
    requiresRemark: dataWithoutId.requiresRemark,
    remarkPrompt: dataWithoutId.remarkPrompt,
    sortOrder: dataWithoutId.sortOrder,
    translations: dataWithoutId.translations,
    teamId,
    userId: user.id
  })
})