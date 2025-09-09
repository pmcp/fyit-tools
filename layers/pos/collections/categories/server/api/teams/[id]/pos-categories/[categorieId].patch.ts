import { updatePosCategorie, getPosCategoriesByIds } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { PosCategorie } from '../../../../../../types'

export default defineEventHandler(async (event) => {
  const { id: teamId, categorieId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<Partial<PosCategorie>>(event)
  
  // Handle translation updates properly
  if (body.translations && body.locale) {
    const [existing] = await getPosCategoriesByIds(teamId, [categorieId])
    if (existing) {
      body.translations = {
        ...existing.translations,
        [body.locale]: {
          ...existing.translations?.[body.locale],
          ...body.translations[body.locale]
        }
      }
    }
  }
  
  return await updatePosCategorie(categorieId, teamId, user.id, {
    eventId: body.eventId,
    name: body.name,
    color: body.color,
    icon: body.icon,
    sortOrder: body.sortOrder,
    isActive: body.isActive,
    translations: body.translations
  })
})