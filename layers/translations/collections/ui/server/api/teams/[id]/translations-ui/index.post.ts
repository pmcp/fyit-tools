import { isTeamAdmin } from '@@/server/utils/teams'
import { createTranslationsUi, getTeamBySlug, getSystemTranslationByKeyPath } from '../../../../database/queries'

export default defineEventHandler(async (event) => {
  const teamSlug = getRouterParam(event, 'id') // This is actually the slug from the URL
  if (!teamSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Team slug is required',
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

  // Validate required fields
  if (!body.keyPath || !body.category || !body.values) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: keyPath, category, values',
    })
  }

  // Check if this is overriding a system translation
  const systemTranslation = await getSystemTranslationByKeyPath(body.keyPath, body.namespace || 'app')

  // If system translation exists and is not overrideable, reject
  if (systemTranslation && !systemTranslation.isOverrideable) {
    throw createError({
      statusCode: 403,
      statusMessage: 'This system translation cannot be overridden',
    })
  }

  // Create team-specific translation
  const newTranslation = {
    userId: user.id,
    teamId: team.id,
    namespace: 'ui',
    keyPath: body.keyPath,
    category: body.category,
    values: body.values,
    description: body.description || null,
    isOverrideable: true, // Team translations are always overrideable
  }

  try {
    return await createTranslationsUi(newTranslation)
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'A translation with this keyPath already exists for this team',
      })
    }
    throw error
  }
})