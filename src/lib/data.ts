import type { PriceList, Product, LaborSettings, OverheadItem, TransportItem, CapitalItem } from './types';

export const inventoryData: PriceList[] = [
  { id: 'inv-1', product: 'Melaza de caña', purchaseQuantity: 1000, measure: 'g', value: 3000, unitValue: 3 },
];

export const packagingData: PriceList[] = [
  { id: 'pkg-1', product: 'Botella PET 1L', purchaseQuantity: 1, measure: 'unid.', value: 500, unitValue: 500 },
];

export const productsData: Product[] = [
  {
    id: 'prod-1',
    name: 'Biofertilizante Líquido',
    batchSize: 50,
    batchUnit: 'l',
    recipe: [
      { inventoryId: 'inv-1', quantity: 15000 },
    ],
    packaging: [
      { packagingId: 'pkg-1', quantity: 50 },
    ],
    laborProcesses: [
      { id: 'lp-1', name: 'Mezcla y Fermentación', time: 120, timeUnit: 'minutos', operators: 1 },
      { id: 'lp-2', name: 'Envasado', time: 60, timeUnit: 'minutos', operators: 2 },
    ],
  },
];

export const laborSettingsData: LaborSettings = {
  monthlyCost: 2000000,
  totalMonthlyHours: 192,
  workHoursPerDay: 8,
};

export const overheadData: OverheadItem[] = [
  { id: 'cif-1', concept: 'Arriendo de Bodega', monthlyValue: 1000000, productionPercentage: 0.7, allocationBasis: 'labor' },
];

export const transportData: TransportItem[] = [
  { id: 'trans-1', concept: 'Distribución Local', monthlyValue: 300000, productionPercentage: 1, allocationBasis: 'labor' },
];

export const capitalData: CapitalItem[] = [
  { id: 'cap-1', concept: 'Depreciación Fermentador', monthlyValue: 150000, productionPercentage: 1, allocationBasis: 'labor' },
];
