import { z } from "zod";

// Collection configuration for posts
export const postsConfig = {
  name: 'posts',
  apiPath: 'posts', // relative to /api/teams/[teamId]/
  componentName: 'PostsForm',
  
  // Schema for validation
  schema: z.object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(100, 'Title must be less than 100 characters'),
    content: z
      .string()
      .min(1, 'Content is required')
      .max(1000, 'Content must be less than 1000 characters'),
    image: z.string().optional(),
  }),
  
  // Default values for new items
  defaultValues: {
    title: '',
    content: '',
    image: '',
  },
  
  // Table columns configuration
  columns: [
    {
      accessorKey: 'userId',
      header: 'User Id',
      sortable: true
    },
    {
      accessorKey: 'image',
      header: 'Image',
      sortable: true
    },
    {
      accessorKey: 'teamId',
      header: 'Team Id',
      sortable: true
    },
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'content',
      header: 'Content'
    },
    {
      accessorKey: 'actions',
      header: 'Actions'
    }
  ],
  
  // Optional transform functions (pure)
  transformForApi: (data: any) => data, // Identity by default
  transformFromApi: (data: any) => data, // Identity by default
}

// Legacy export for compatibility
export default function () {
  return {
    defaultValue: postsConfig.defaultValues,
    schema: postsConfig.schema,
    columns: postsConfig.columns
  }
}
