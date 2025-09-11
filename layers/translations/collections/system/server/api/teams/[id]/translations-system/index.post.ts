import { createTranslationsSystemTranslation } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'

export default defineEventHandler(async (event) => {
  const { id: teamId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  
  // Exclude id field to let the database generate it
  const { id, ...dataWithoutId } = body
  
  return await createTranslationsSystemTranslation({
    ...dataWithoutId,
    teamId,
    userId: user.id
  })
})