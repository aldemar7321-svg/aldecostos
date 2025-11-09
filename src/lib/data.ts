import type { PriceList, Product, LaborSettings, OverheadItem } from './types';

export const inventoryData: PriceList[] = [
  { id: '1', product: 'Harina', measure: 'kg', value: 50, unitValue: 1.0 },
];

export const productsData: Product[] = [
  {
    id: 'prod-1',
    name: 'Producto de Ejemplo',
    batchSize: 10,
    batchUnit: 'unid.',
    recipe: [
      { inventoryId: '1', quantity: 5 },
    ],
    laborProcesses: [
      { id: 'lp-1', name: 'Proceso de Ejemplo', time: 30, timeUnit: 'minutos', operators: 1 },
    ],
  },
];

export const laborSettingsData: LaborSettings = {
  monthlyCost: 3000,
  totalMonthlyHours: 160,
  workHoursPerDay: 8,
};

export const overheadData: OverheadItem[] = [
  { id: 'cif-1', concept: 'Arriendo', monthlyValue: 800, productionPercentage: 0.7 },
];
