import { updateTranslationsSystemTranslation } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { TranslationsSystemTranslation } from '../../../../../../types'

export default defineEventHandler(async (event) => {
  const { id: teamId, systemtranslationId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<Partial<TranslationsSystemTranslation>>(event)
  
  return await updateTranslationsSystemTranslation(systemtranslationId, teamId, user.id, {
    keyPath: body.keyPath,
    category: body.category,
    values: body.values,
    description: body.description
  })
})