import { updateTranslationsUi } from '../../../database/queries'

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
  const body = await readBody(event)

  // Validate values if provided - ensure at least English is present
  if (body.values) {
    if (!body.values.en) {
      throw createError({
        statusCode: 400,
        statusMessage: 'English translation is required',
      })
    }
  }

  // Update translation
  const updateData = {
    ...(body.keyPath && { keyPath: body.keyPath }),
    ...(body.category && { category: body.category }),
    ...(body.values && { values: body.values }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.namespace !== undefined && { namespace: body.namespace }),
    ...(body.isOverrideable !== undefined && { isOverrideable: body.isOverrideable }),
    updatedAt: new Date(),
  }

  // Ensure we're only updating system translations (teamId=null)
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

  return await updateTranslationsUi(id, updateData)
})