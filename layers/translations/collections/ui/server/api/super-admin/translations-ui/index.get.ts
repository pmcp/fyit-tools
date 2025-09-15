import { getAllSystemTranslationsWithOverrideCounts, getSystemTranslationsByIds } from '../../../database/queries'
import { eq, and, isNull, desc, asc, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // Check if user is super admin
  const { user } = await requireUserSession(event)
  if (!user.superAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Super admin access required',
    })
  }

  const query = getQuery(event)
  const keyPath = query.keyPath as string | undefined
  const ids = query.ids as string | undefined

  // Pagination parameters
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const sortBy = (query.sortBy as string) || 'createdAt'
  const sortDirection = (query.sortDirection as string) || 'desc'

  console.log('[API translations-ui GET] Query params:', {
    ids,
    keyPath,
    page: query.page,
    limit: query.limit,
    hasPageParam: query.page !== undefined,
    hasLimitParam: query.limit !== undefined,
    fullQuery: query
  })

  // Calculate offset
  const offset = (page - 1) * limit

  // If ids are provided, fetch specific translations by their IDs
  if (ids) {
    const idArray = ids.split(',').filter(id => id.trim())

    console.log('[API translations-ui GET] Fetching by IDs:', idArray)

    if (idArray.length === 0) {
      return []
    }

    const translations = await getSystemTranslationsByIds(idArray)

    console.log('[API translations-ui GET] Found translations:', {
      count: translations.length,
      firstItem: translations[0],
      returning: idArray.length === 1 ? 'single item' : 'array'
    })

    // Return single item if only one ID was requested
    if (idArray.length === 1) {
      return translations[0] || null
    }

    return translations
  }

  // If keyPath is provided, fetch specific translation
  if (keyPath) {
    const db = useDB()
    const translations = await db
      .select()
      .from(tables.translationsUi)
      .where(
        and(
          eq(tables.translationsUi.keyPath, keyPath),
          isNull(tables.translationsUi.teamId)
        )
      )
    return translations
  }

  // Check if pagination is requested
  if (query.page || query.limit) {
    const db = useDB()

    // Get total count for pagination metadata
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tables.translationsUi)
      .where(isNull(tables.translationsUi.teamId))

    const totalItems = countResult?.count || 0
    const totalPages = Math.ceil(totalItems / limit)

    // Build order by clause
    let orderByClause
    if (sortBy === 'keyPath') {
      orderByClause = sortDirection === 'desc' ? desc(tables.translationsUi.keyPath) : asc(tables.translationsUi.keyPath)
    } else if (sortBy === 'category') {
      orderByClause = sortDirection === 'desc' ? desc(tables.translationsUi.category) : asc(tables.translationsUi.category)
    } else {
      orderByClause = sortDirection === 'desc' ? desc(tables.translationsUi.createdAt) : asc(tables.translationsUi.createdAt)
    }

    // Fetch paginated data
    const items = await db
      .select()
      .from(tables.translationsUi)
      .where(isNull(tables.translationsUi.teamId))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset)

    // Return paginated response with metadata
    return {
      items,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems,
        totalPages
      }
    }
  }

  // Otherwise fetch all system translations with override counts (backward compatibility)
  return await getAllSystemTranslationsWithOverrideCounts()
})