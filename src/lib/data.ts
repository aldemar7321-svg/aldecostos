import type { PriceList, Product, LaborSettings, OverheadItem } from './types';

export const inventoryData: PriceList[] = [
  { id: '1', product: 'Harina', measure: 'lb', value: 50, unitValue: 1.0 },
  { id: '2', product: 'Azúcar', measure: 'lb', value: 30, unitValue: 0.6 },
  { id: '3', product: 'Huevos', measure: 'unid', value: 15, unitValue: 0.25 },
  { id: '4', product: 'Levadura', measure: 'lb', value: 5, unitValue: 5.0 },
  { id: '5', product: 'Sal', measure: 'lb', value: 2, unitValue: 0.5 },
  { id: '6', product: 'Mantequilla', measure: 'lb', value: 20, unitValue: 4.0 },
  { id: '7', product: 'Leche', measure: 'lt', value: 4, unitValue: 1.0 },
];

export const productsData: Product[] = [
  {
    id: 'prod-1',
    name: 'Pan Dulce',
    batchSize: 10,
    recipe: [
      { inventoryId: '1', quantity: 5 },
      { inventoryId: '2', quantity: 2 },
      { inventoryId: '3', quantity: 12 },
      { inventoryId: '4', quantity: 0.5 },
      { inventoryId: '6', quantity: 1 },
    ],
    laborProcesses: [
      { id: 'lp-1', name: 'Amasar', time: 30, timeUnit: 'minutos', operators: 1 },
      { id: 'lp-2', name: 'Leudar', time: 60, timeUnit: 'minutos', operators: 0 },
      { id: 'lp-3', name: 'Hornear', time: 25, timeUnit: 'minutos', operators: 1 },
    ],
  },
  {
    id: 'prod-2',
    name: 'Pan Salado',
    batchSize: 15,
    recipe: [
      { inventoryId: '1', quantity: 8 },
      { inventoryId: '5', quantity: 0.2 },
      { inventoryId: '4', quantity: 0.7 },
      { inventoryId: '7', quantity: 1 },
    ],
    laborProcesses: [
      { id: 'lp-1', name: 'Amasar', time: 45, timeUnit: 'minutos', operators: 1 },
      { id: 'lp-2', name: 'Leudar', time: 45, timeUnit: 'minutos', operators: 0 },
      { id: 'lp-3', name: 'Hornear', time: 30, timeUnit: 'minutos', operators: 1 },
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
  { id: 'cif-2', concept: 'Electricidad', monthlyValue: 250, productionPercentage: 0.9 },
  { id: 'cif-3', concept: 'Gas', monthlyValue: 300, productionPercentage: 1.0 },
  { id: 'cif-4', concept: 'Agua', monthlyValue: 100, productionPercentage: 0.8 },
  { id: 'cif-5', concept: 'Mantenimiento', monthlyValue: 150, productionPercentage: 1.0 },
];
