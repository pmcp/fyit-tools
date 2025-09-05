// Tasks database queries using the base CRUD utilities
import {
  createGetAllQuery,
  createGetByIdsQuery,
  createInsertQuery,
  createUpdateQuery,
  createDeleteQuery,
  type CrudQueryOptions
} from '~~/layers/crud/server/database/baseCrudQueries'

// Define tasks-specific options
const tasksOptions: CrudQueryOptions = {
  tableName: 'tasks',
  teamIdField: 'teamId',
  userIdField: 'userId',
  orderByField: 'createdAt',
  orderDirection: 'desc'
}

// Export queries using the generic base implementations
export const getAllTasks = createGetAllQuery(tasksOptions)
export const getTasksByIds = createGetByIdsQuery(tasksOptions)
export const createTask = createInsertQuery(tasksOptions)
export const updateTask = createUpdateQuery(tasksOptions)
export const deleteTask = createDeleteQuery(tasksOptions)

// You can also add custom queries specific to tasks here
export const getTasksByStatus = async (teamId: string, status: string) => {
  try {
    const tasks = await useDB().query.tasks.findMany({
      where: and(
        eq(tables.tasks.teamId, teamId),
        eq(tables.tasks.status, status)
      ),
      orderBy: [desc(tables.tasks.priority), desc(tables.tasks.createdAt)],
    })
    return tasks
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get tasks by status',
    })
  }
}