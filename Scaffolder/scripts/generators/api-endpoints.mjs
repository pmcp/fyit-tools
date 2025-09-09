// Generator for API endpoints

export function generateGetEndpoint(data) {
  const { pascalCase, pascalCasePlural, layerPascalCase } = data
  const prefixedPascalCase = `${layerPascalCase}${pascalCase}`
  const prefixedPascalCasePlural = `${layerPascalCase}${pascalCasePlural}`

  return `import { getAll${prefixedPascalCasePlural}, get${prefixedPascalCasePlural}ByIds } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'

export default defineEventHandler(async (event) => {
  const { id: teamId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const query = getQuery(event)
  if (query.ids) {
    const ids = String(query.ids).split(',')
    return await get${prefixedPascalCasePlural}ByIds(teamId, ids)
  }
  
  return await getAll${prefixedPascalCasePlural}(teamId)
})`
}

export function generatePostEndpoint(data) {
  const { singular, pascalCase, layerPascalCase } = data
  const prefixedPascalCase = `${layerPascalCase}${pascalCase}`

  return `import { create${prefixedPascalCase} } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'

export default defineEventHandler(async (event) => {
  const { id: teamId } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  
  // Exclude id field to let the database generate it
  const { id, ...dataWithoutId } = body
  
  return await create${prefixedPascalCase}({
    ...dataWithoutId,
    teamId,
    userId: user.id
  })
})`
}

export function generatePatchEndpoint(data) {
  const { singular, pascalCase, layerPascalCase, fields } = data
  const prefixedPascalCase = `${layerPascalCase}${pascalCase}`

  // Generate field selection for update
  const fieldSelection = fields.map(field => `    ${field.name}: body.${field.name}`).join(',\n')

  return `import { update${prefixedPascalCase} } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import type { ${prefixedPascalCase} } from '../../../../../../types'

export default defineEventHandler(async (event) => {
  const { id: teamId, ${singular}Id } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<Partial<${prefixedPascalCase}>>(event)
  return await update${prefixedPascalCase}(${singular}Id, teamId, user.id, {
${fieldSelection}
  })
})`
}

export function generateDeleteEndpoint(data) {
  const { singular, pascalCase, layerPascalCase } = data
  const prefixedPascalCase = `${layerPascalCase}${pascalCase}`

  return `import { delete${prefixedPascalCase} } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'

export default defineEventHandler(async (event) => {
  const { id: teamId, ${singular}Id } = getRouterParams(event)
  const { user } = await requireUserSession(event)
  const hasAccess = await isTeamMember(teamId, user.id)
  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  return await delete${prefixedPascalCase}(${singular}Id, teamId, user.id)
})`
}