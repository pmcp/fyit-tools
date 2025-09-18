import { updateFeedback } from '@@/server/database/queries/admin'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!user.superAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You are not authorized to access this resource',
    })
  }

  const { id } = getRouterParams(event)
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Feedback ID is required',
    })
  }
  const { status } = await readBody(event)
  const updatedFeedback = await updateFeedback(id, { status: status })
  return updatedFeedback
})
