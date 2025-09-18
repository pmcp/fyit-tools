import { unlinkAccount } from '@@/server/database/queries/users'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { providerId } = getRouterParams(event)
  if (!providerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Provider ID is required',
    })
  }
  await unlinkAccount(user.id, providerId)
  sendNoContent(event)
})
