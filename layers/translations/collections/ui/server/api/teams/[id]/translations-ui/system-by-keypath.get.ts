import { eq, and, isNull } from 'drizzle-orm'
import { isTeamMember } from '@@/server/utils/teams'

export default defineEventHandler(async (event) => {
  const teamSlug = getRouterParam(event, 'id')
  const { user } = await requireUserSession(event)
  const query = getQuery(event)
  const keyPath = query.keyPath as string | undefined

  if (!keyPath) {
    throw createError({
      statusCode: 400,
      statusMessage: 'keyPath query parameter is required'
    })
  }

  const db = useDB()

  // Verify team and access
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

  const hasAccess = await isTeamMember(team.id, user.id)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized'
    })
  }

  // Fetch the specific system translation
  const translation = await db
    .select()
    .from(tables.translationsUi)
    .where(
      and(
        eq(tables.translationsUi.keyPath, keyPath),
        isNull(tables.translationsUi.teamId)
      )
    )
    .get()

  if (!translation) {
    throw createError({
      statusCode: 404,
      statusMessage: 'System translation not found'
    })
  }

  return translation
})