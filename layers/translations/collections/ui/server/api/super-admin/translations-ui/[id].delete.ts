import { deleteTranslationsUi } from '../../../database/queries'

export default defineEventHandler(async (event) => {
  // Check if user is super admin
  const { user } = await requireUserSession(event)
  if (!user.superAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Super admin access required',
    })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Translation ID is required',
    })
  }

  // Ensure we're only deleting system translations (teamId=null)
  const db = useDB()
  const existing = await db
    .select()
    .from(tables.translationsUi)
    .where(eq(tables.translationsUi.id, id))
    .get()
  
  if (!existing || existing.teamId !== null) {
    throw createError({
      statusCode: 404,
      statusMessage: 'System translation not found',
    })
  }

  return await deleteTranslationsUi(id)
})