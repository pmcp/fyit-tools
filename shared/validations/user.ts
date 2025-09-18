import { z } from 'zod'

export const updateUserSchema = z.object({
  name: z.string(),
  avatarUrl: z.string().nullable().optional(),
})
