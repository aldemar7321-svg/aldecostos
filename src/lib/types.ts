export interface PriceList {
  id: string;
  product: string; 
  measure: string;
  value: number;
  unitValue: number; 
}

export interface Ingredient {
  inventoryId: string;
  quantity: number;
}

export interface PackagingItem {
  packagingId: string;
  quantity: number;
}

export interface LaborProcess {
  id: string;
  name: string;
  time: number;
  timeUnit: 'minutos' | 'horas';
  operators: number;
}

export interface Product {
  id:string;
  name: string;
  batchSize: number;
  batchUnit: string;
  recipe: Ingredient[];
  packaging: PackagingItem[];
  laborProcesses: LaborProcess[];
}

export interface LaborSettings {
  monthlyCost: number;
  totalMonthlyHours: number;
  workHoursPerDay: number;
}

export interface OverheadItem {
  id: string;
  concept: string;
  monthlyValue: number;
  productionPercentage: number;
}

export interface TransportItem {
  id: string;
  concept: string;
  monthlyValue: number;
  productionPercentage: number;
}

export interface CapitalItem {
  id: string;
  concept: string;
  monthlyValue: number;
  productionPercentage: number;
}
