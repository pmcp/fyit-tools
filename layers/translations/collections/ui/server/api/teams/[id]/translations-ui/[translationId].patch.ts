import { and, eq } from 'drizzle-orm'
import { isTeamAdmin } from '@@/server/utils/teams'
import { updateTranslationsUi } from '../../../../database/queries'

export default defineEventHandler(async (event) => {
  const teamSlug = getRouterParam(event, 'id') // This is actually the slug from the URL
  const translationId = getRouterParam(event, 'translationId')
  const { user } = await requireUserSession(event)
  
  const db = useDB()
  
  // First, get the team by slug to get the actual team ID
  const team = await db
    .select()
    .from(tables.teams)
    .where(eq(tables.teams.slug, teamSlug))
    .get()
    
  if (!team) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Team not found'
    })
  }
  
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
  const existing = await db
    .select()
    .from(tables.translationsUi)
    .where(
      and(
        eq(tables.translationsUi.id, translationId),
        eq(tables.translationsUi.teamId, team.id)
      )
    )
    .get()

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Translation not found or does not belong to this team',
    })
  }

  // Update translation - for teams, only allow updating values and description
  const updateData = {
    ...(body.values && { values: body.values }),
    ...(body.description !== undefined && { description: body.description }),
    // Don't allow teams to update category, keyPath, or isOverrideable
    updatedAt: new Date(),
  }

  return await updateTranslationsUi(translationId, updateData)
})