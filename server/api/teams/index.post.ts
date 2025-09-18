import { createTeam } from '@@/server/database/queries/teams'
import { createTeamSchema } from '@@/shared/validations/team'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await readValidatedBody(event, createTeamSchema.parse)
  const team = await createTeam({
    name: body.name,
    ownerId: user.id,
    slug: body.slug,
    logo: body.logo,
  })
  return team
})
