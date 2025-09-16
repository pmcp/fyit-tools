import { isTeamAdmin } from '@@/server/utils/teams'
import {
  getTeamBySlug,
  getSystemTranslationByKeyPath,
  getTeamTranslations,
  updateTranslationsUi,
  createTranslationsUi
} from '../../../database/queries'

export default defineEventHandler(async (event) => {
  const teamSlug = getRouterParam(event, 'id') // This is actually the slug from the URL
  const { keyPath, values, category = 'ui', createIfNotExists = false } = await readBody(event)

  if (!teamSlug || !keyPath || !values) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    })
  }

  try {
    // Get the team by slug
    const team = await getTeamBySlug(teamSlug)

    // For dev mode, we'll allow editing without strict auth check
    // In production, you'd want to add proper auth here
    const { user } = await getUserSession(event).catch(() => ({ user: null }))

    // Check if team override already exists
    const teamTranslations = await getTeamTranslations(team.id)
    const existingOverride = teamTranslations.find(
      (t: any) => t.keyPath === keyPath && t.category === category
    )

    if (existingOverride) {
      // Update existing override
      return await updateTranslationsUi(existingOverride.id, {
        values,
        updatedAt: new Date()
      })
    } else {
      // Check if system translation exists (for reference)
      const systemTranslation = await getSystemTranslationByKeyPath(keyPath, category)

      // If no system translation exists and createIfNotExists is true, create it first
      if (!systemTranslation && createIfNotExists) {
        await createTranslationsUi({
          teamId: null, // System translation
          keyPath,
          category,
          namespace: category,
          values,
          userId: user?.id || 'dev-mode-auto-create',
          description: `Auto-created via dev mode editing for key: ${keyPath}`,
          isOverrideable: true
        })
      }

      // Create new team override
      const newTranslation = await createTranslationsUi({
        teamId: team.id,
        keyPath,
        category,
        namespace: category,
        values,
        userId: user?.id || 'dev-mode-edit',
        description: createIfNotExists ?
          'Created via dev mode editing (new translation)' :
          'Created via dev mode editing',
        isOverrideable: true
      })

      return newTranslation
    }
  } catch (error: any) {
    console.error('Failed to save team translation:', error)

    // Handle duplicate key errors
    if (error.message?.includes('UNIQUE constraint failed')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Translation already exists'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save translation'
    })
  }
})