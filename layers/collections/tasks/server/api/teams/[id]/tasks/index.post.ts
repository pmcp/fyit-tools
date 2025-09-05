import { createTask } from '../../../../database/queries'
import { isTeamMember } from '@@/server/database/queries/teams'
import { z } from 'zod'

// Validation schema for task creation
const createTaskSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().optional(),
})

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
  
  // Validate request body
  const body = await readBody(event)
  const validatedData = createTaskSchema.parse(body)
  
  const payload = {
    ...validatedData,
    teamId,
    userId: user.id,
  }
  
  const task = await createTask(payload)
  return task
})