import { isTeamAdmin } from '@@/server/utils/teams'
import { updateTranslationsUi, getTeamBySlug, verifyTeamTranslation } from '../../../../database/queries'

export default defineEventHandler(async (event) => {
  const teamSlug = getRouterParam(event, 'id') // This is actually the slug from the URL
  const translationId = getRouterParam(event, 'translationId')

  if (!teamSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Team slug is required',
    })
  }
  if (!translationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Translation ID is required',
    })
  }

  const { user } = await requireUserSession(event)

  // Get the team by slug
  const team = await getTeamBySlug(teamSlug)

  // Check if user is admin of this team
  const hasAccess = await isTeamAdmin(team.id, user.id)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized - admin access required'
    })
  }

  const body = await readBody(event)

  // Verify the translation belongs to this team
  await verifyTeamTranslation(translationId, team.id)

  // Update translation - for teams, only allow updating values and description
  const updateData = {
    ...(body.values && { values: body.values }),
    ...(body.description !== undefined && { description: body.description }),
    // Don't allow teams to update category, keyPath, or isOverrideable
    updatedAt: new Date(),
  }

  return await updateTranslationsUi(translationId, updateData)
})