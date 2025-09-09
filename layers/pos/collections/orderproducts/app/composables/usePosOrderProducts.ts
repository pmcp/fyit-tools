import { z } from 'zod'

export const posOrderProductSchema = z.object({
  orderId: z.number().min(1, 'orderId is required'),
  productId: z.number().min(1, 'productId is required'),
  quantity: z.number().min(1, 'quantity is required'),
  unitPrice: z.number().optional(),
  taxRate: z.number().optional(),
  discountAmount: z.number().optional(),
  totalAmount: z.number().optional(),
  notes: z.string().optional(),
  totalPrice: z.number().optional(),
  remarks: z.string().optional()
})

export const posOrderProductsColumns = [
  { accessorKey: 'orderId', header: 'OrderId' },
  { accessorKey: 'productId', header: 'ProductId' },
  { accessorKey: 'quantity', header: 'Quantity' },
  { accessorKey: 'unitPrice', header: 'UnitPrice' },
  { accessorKey: 'taxRate', header: 'TaxRate' },
  { accessorKey: 'discountAmount', header: 'DiscountAmount' },
  { accessorKey: 'totalAmount', header: 'TotalAmount' },
  { accessorKey: 'notes', header: 'Notes' },
  { accessorKey: 'totalPrice', header: 'TotalPrice' },
  { accessorKey: 'remarks', header: 'Remarks' },
  { accessorKey: 'actions', header: 'Actions' }
]

export const posOrderProductsConfig = {
  name: 'posOrderProducts',
  apiPath: 'pos-orderproducts',
  componentName: 'PosOrderProductsForm',
  schema: posOrderProductSchema,
  defaultValues: {
    orderId: 0,
    productId: 0,
    quantity: 0,
    unitPrice: 0,
    taxRate: 0,
    discountAmount: 0,
    totalAmount: 0,
    notes: '',
    totalPrice: 0,
    remarks: ''
  },
  columns: posOrderProductsColumns,
}

export const usePosOrderProducts = () => posOrderProductsConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posOrderProductsConfig.defaultValues,
    schema: posOrderProductsConfig.schema,
    columns: posOrderProductsConfig.columns
  }
}