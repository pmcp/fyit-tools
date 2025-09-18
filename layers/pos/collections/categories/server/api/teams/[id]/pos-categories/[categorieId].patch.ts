import { updatePosCategorie, getPosCategoriesByIds } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { PosCategorie } from '../../../../../types'

type PatchBody = Partial<PosCategorie> & {
  translations?: Record<string, any>
  locale?: string
}

export default defineEventHandler(async (event) => {
  const { id: teamId, categorieId } = getRouterParams(event)
  if (!teamId || typeof teamId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Team ID is required' })
  }
  if (!categorieId || typeof categorieId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Categorie ID is required' })
  }
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<PatchBody>(event)
  
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