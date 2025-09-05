import { getAllPosts, getPostsByIds } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'

export default defineEventHandler(async (event) => {
  const { id: teamId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized Access',
    })
  }

  const query = getQuery(event)
  const ids = query.ids
  if (ids) {
    const postIds = Array.isArray(ids)
      ? ids.map(String)
      : typeof ids === 'string'
        ? ids.split(',')
        : [String(ids)]
    return await getPostsByIds(teamId, postIds)
  }

  return await getAllPosts(teamId)
})