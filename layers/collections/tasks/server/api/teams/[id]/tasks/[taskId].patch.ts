import { updateTask } from '../../../../database/queries'
import { z } from 'zod'

// Validation schema for task updates
const updateTaskSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event)
  const teamId = params.id
  const taskId = params.taskId
  const { user } = await requireUserSession(event)
  
  // Validate request body
  const body = await readBody(event)
  const validatedUpdates = updateTaskSchema.parse(body)
  
  const task = await updateTask(taskId, teamId, user.id, validatedUpdates)
  return task
})