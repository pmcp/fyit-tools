import { and, eq } from 'drizzle-orm'
import { teams, teamMembers } from '@@/server/database/schema/teams'

/**
 * Check if a user is a member of a team
 */
export async function isTeamMember(teamId: string, userId: string): Promise<boolean> {
  const db = useDB()

  // Check if user is owner
  const team = await db
    .select()
    .from(teams)
    .where(eq(teams.id, teamId))
    .get()

  if (team?.ownerId === userId) {
    return true
  }

  // Check if user is a member
  const member = await db
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.userId, userId)
      )
    )
    .get()

  return !!member
}

/**
 * Check if a user is an admin or owner of a team
 */
export async function isTeamAdmin(teamId: string, userId: string): Promise<boolean> {
  const db = useDB()

  // Check if user is owner
  const team = await db
    .select()
    .from(teams)
    .where(eq(teams.id, teamId))
    .get()

  if (team?.ownerId === userId) {
    return true
  }

  // Check if user is an admin member
  const member = await db
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.userId, userId)
      )
    )
    .get()

  return member?.role === 'admin' || member?.role === 'owner'
}

/**
 * Check if a user is the owner of a team
 */
export async function isTeamOwner(teamId: string, userId: string): Promise<boolean> {
  const db = useDB()

  const team = await db
    .select()
    .from(teams)
    .where(eq(teams.id, teamId))
    .get()

  return team?.ownerId === userId
}
