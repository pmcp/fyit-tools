import { getTeamOverridesForTranslation } from '../../../../database/queries'

export default defineEventHandler(async (event) => {
  // Check if user is super admin
  const { user } = await requireUserSession(event)
  if (!user.superAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Super admin access required',
    })
  }

  const { keyPath } = getRouterParams(event)
  const query = getQuery(event)
  const namespace = (query.namespace as string) || 'ui'

  if (!keyPath) {
    throw createError({
      statusCode: 400,
      statusMessage: 'keyPath parameter is required',
    })
  }

  // Decode the keyPath in case it contains dots or special characters
  const decodedKeyPath = decodeURIComponent(keyPath)

  // Fetch team overrides for this translation
  const overrides = await getTeamOverridesForTranslation(decodedKeyPath, namespace)

  return overrides
})