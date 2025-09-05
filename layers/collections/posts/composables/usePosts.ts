import { z } from "zod";
export default function () {
  const defaultValue = {
    title: '',
    content: '',
    image: '',
  }

  const schema = z.object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(100, 'Title must be less than 100 characters'),
    content: z
      .string()
      .min(1, 'Content is required')
      .max(1000, 'Content must be less than 1000 characters'),
    image: z.string().optional(),
  })



  const columns = [
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
  ]


  return {
    defaultValue,
    schema,
    columns
  }
}
