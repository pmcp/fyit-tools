import { and, eq, isNull } from 'drizzle-orm'
import { isTeamMember } from '@@/server/utils/teams'

export default defineEventHandler(async (event) => {
  const teamSlug = getRouterParam(event, 'id') // This is actually the slug from the URL
  const { user } = await requireUserSession(event)
  
  const db = useDB()
  
  // First, get the team by slug to get the actual team ID
  const team = await db
    .select()
    .from(tables.teams)
    .where(eq(tables.teams.slug, teamSlug))
    .get()
    
  if (!team) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Team not found'
    })
  }
  
  // Check if user has access to this team
  const hasAccess = await isTeamMember(team.id, user.id)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized - you are not a member of this team'
    })
  }

  const query = getQuery(event)
  const keyPath = query.keyPath as string
  const namespace = (query.namespace as string) || 'ui'
  const locale = (query.locale as string) || 'en'

  if (!keyPath) {
    throw createError({
      statusCode: 400,
      statusMessage: 'keyPath parameter is required',
    })
  }

  // First, try to get team-specific translation
  const teamTranslation = await db
    .select()
    .from(tables.translationsUi)
    .where(
      and(
        eq(tables.translationsUi.teamId, team.id),
        eq(tables.translationsUi.keyPath, keyPath),
        eq(tables.translationsUi.namespace, namespace)
      )
    )
    .get()

  if (teamTranslation?.values?.[locale]) {
    return {
      source: 'team',
      keyPath,
      namespace,
      locale,
      value: teamTranslation.values[locale],
      translation: teamTranslation
    }
  }

  // Fall back to system translation
  const systemTranslation = await db
    .select()
    .from(tables.translationsUi)
    .where(
      and(
        isNull(tables.translationsUi.teamId),
        eq(tables.translationsUi.keyPath, keyPath),
        eq(tables.translationsUi.namespace, namespace)
      )
    )
    .get()

  if (systemTranslation?.values?.[locale]) {
    return {
      source: 'system',
      keyPath,
      namespace,
      locale,
      value: systemTranslation.values[locale],
      translation: systemTranslation,
      isOverrideable: systemTranslation.isOverrideable
    }
  }

  // No translation found, return the key itself
  return {
    source: 'none',
    keyPath,
    namespace,
    locale,
    value: keyPath,
    translation: null
  }
})