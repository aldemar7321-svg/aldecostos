import type { PriceList, Product, LaborSettings, OverheadItem, TransportItem, CapitalItem } from './types';

export const inventoryData: PriceList[] = [
  { id: 'inv-1', product: 'Harina de Trigo', measure: 'kg', value: 2500, unitValue: 2.5 },
];

export const packagingData: PriceList[] = [
  { id: 'pkg-1', product: 'Bolsa Plástica', measure: 'unid.', value: 100, unitValue: 0.1 },
];

export const productsData: Product[] = [
  {
    id: 'prod-1',
    name: 'Pan de Ejemplo',
    batchSize: 100,
    batchUnit: 'unid.',
    recipe: [
      { inventoryId: 'inv-1', quantity: 10 },
    ],
    packaging: [
      { packagingId: 'pkg-1', quantity: 100 },
    ],
    laborProcesses: [
      { id: 'lp-1', name: 'Amasado', time: 60, timeUnit: 'minutos', operators: 1 },
      { id: 'lp-2', name: 'Horneado', time: 30, timeUnit: 'minutos', operators: 1 },
    ],
  },
];

export const laborSettingsData: LaborSettings = {
  monthlyCost: 2000000,
  totalMonthlyHours: 192,
  workHoursPerDay: 8,
};

export const overheadData: OverheadItem[] = [
  { id: 'cif-1', concept: 'Arriendo', monthlyValue: 1000000, productionPercentage: 0.7, allocationBasis: 'labor' },
];

export const transportData: TransportItem[] = [
  { id: 'trans-1', concept: 'Envío Local', monthlyValue: 300000, productionPercentage: 1, allocationBasis: 'labor' },
];

export const capitalData: CapitalItem[] = [
  { id: 'cap-1', concept: 'Depreciación Horno', monthlyValue: 150000, productionPercentage: 1, allocationBasis: 'labor' },
];
