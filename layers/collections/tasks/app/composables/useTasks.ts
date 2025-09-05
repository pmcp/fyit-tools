import { z } from "zod";

// Collection configuration for tasks
export const tasksConfig = {
  name: 'tasks',
  apiPath: 'tasks', // relative to /api/teams/[teamId]/
  componentName: 'TasksForm',
  
  // Schema for validation
  schema: z.object({
    name: z
      .string()
      .min(1, 'Task name is required')
      .max(200, 'Task name must be less than 200 characters'),
    description: z
      .string()
      .optional(),
    status: z
      .enum(['todo', 'in_progress', 'done'])
      .default('todo'),
    priority: z
      .enum(['low', 'medium', 'high'])
      .default('medium'),
    dueDate: z
      .string()
      .optional(),
  }),
  
  // Default values for new items
  defaultValues: {
    name: '',
    description: '',
    status: 'todo' as const,
    priority: 'medium' as const,
    dueDate: '',
  },
  
  // Table columns configuration
  columns: [
    {
      accessorKey: 'name',
      header: 'Task Name',
      sortable: true
    },
    {
      accessorKey: 'status',
      header: 'Status',
      sortable: true
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      sortable: true
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      sortable: true
    },
    {
      accessorKey: 'actions',
      header: 'Actions'
    }
  ],
  
  // Optional: Define modal config if needed (defaults to slideover)
  // modalConfig: {
  //   component: 'UModal',
  //   props: { size: 'lg' }
  // },
  
  // Optional transform functions (pure)
  transformForApi: (data: any) => data,
  transformFromApi: (data: any) => data,
}

// Legacy export for compatibility
export default function () {
  return {
    defaultValue: tasksConfig.defaultValues,
    schema: tasksConfig.schema,
    columns: tasksConfig.columns
  }
}