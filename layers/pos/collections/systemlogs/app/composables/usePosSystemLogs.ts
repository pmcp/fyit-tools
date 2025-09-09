import { z } from 'zod'

export const posSystemLogSchema = z.object({
  logType: z.string().optional(),
  message: z.string().optional(),
  metadata: z.object({}).optional(),
  eventId: z.number().optional()
})

export const posSystemLogsColumns = [
  { accessorKey: 'logType', header: 'LogType' },
  { accessorKey: 'message', header: 'Message' },
  { accessorKey: 'metadata', header: 'Metadata' },
  { accessorKey: 'eventId', header: 'EventId' },
  { accessorKey: 'actions', header: 'Actions' }
]

export const posSystemLogsConfig = {
  name: 'posSystemLogs',
  apiPath: 'pos-systemlogs',
  componentName: 'PosSystemLogsForm',
  schema: posSystemLogSchema,
  defaultValues: {
    logType: '',
    message: '',
    metadata: {},
    eventId: 0
  },
  columns: posSystemLogsColumns,
}

export const usePosSystemLogs = () => posSystemLogsConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posSystemLogsConfig.defaultValues,
    schema: posSystemLogsConfig.schema,
    columns: posSystemLogsConfig.columns
  }
}