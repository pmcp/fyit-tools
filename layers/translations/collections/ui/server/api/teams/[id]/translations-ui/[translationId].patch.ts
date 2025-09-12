import { and, eq } from 'drizzle-orm'
import { isTeamAdmin } from '@@/server/utils/teams'
import { updateTranslationsUi } from '../../../../database/queries'

export default defineEventHandler(async (event) => {
  const { id: teamId, translationId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  
  // Check if user is admin of this team
  const hasAccess = await isTeamAdmin(teamId, user.id)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized - admin access required'
    })
  }

  const body = await readBody(event)

  // Verify the translation belongs to this team
  const db = useDB()
  const existing = await db
    .select()
    .from(tables.translationsUi)
    .where(
      and(
        eq(tables.translationsUi.id, translationId),
        eq(tables.translationsUi.teamId, teamId)
      )
    )
    .get()

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Translation not found or does not belong to this team',
    })
  }

  // Update translation
  const updateData = {
    ...(body.values && { values: body.values }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.category !== undefined && { category: body.category }),
    updatedAt: new Date(),
  }

  return await updateTranslationsUi(translationId, updateData)
})