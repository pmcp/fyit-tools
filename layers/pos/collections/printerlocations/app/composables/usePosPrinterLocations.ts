import { z } from 'zod'

export const posPrinterLocationSchema = z.object({
  printerId: z.number().min(1, 'printerId is required'),
  locationId: z.number().min(1, 'locationId is required')
})

export const posPrinterLocationsColumns = [
  { accessorKey: 'printerId', header: 'PrinterId' },
  { accessorKey: 'locationId', header: 'LocationId' },
  { accessorKey: 'actions', header: 'Actions' }
]

export const posPrinterLocationsConfig = {
  name: 'posPrinterLocations',
  apiPath: 'pos-printerlocations',
  componentName: 'PosPrinterLocationsForm',
  schema: posPrinterLocationSchema,
  defaultValues: {
    printerId: 0,
    locationId: 0
  },
  columns: posPrinterLocationsColumns,
}

export const usePosPrinterLocations = () => posPrinterLocationsConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posPrinterLocationsConfig.defaultValues,
    schema: posPrinterLocationsConfig.schema,
    columns: posPrinterLocationsConfig.columns
  }
}