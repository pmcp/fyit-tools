import { eq } from 'drizzle-orm'
import { isTeamMember } from '@@/server/utils/teams'
import { getOverrideableSystemTranslations } from '../../../../database/queries'
import { teams } from '../../../../../../../../../server/database/schema/teams'

export default defineEventHandler(async (event) => {
  const teamSlug = getRouterParam(event, 'id')
  const { user } = await requireUserSession(event)

  const db = useDB()

  // Verify team and access
  const team = await db
    .select()
    .from(teams)
    .where(eq(teams.slug, teamSlug))
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

  return await getOverrideableSystemTranslations()
})
