export interface PriceList {
  id: string;
  product: string; 
  measure: string;
  purchaseQuantity?: number;
  value: number;
  unitValue: number; 
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
  packaging: PackagingItem[];
  laborProcesses: LaborProcess[];
}

export interface LaborSettings {
  monthlyCost: number;
  totalMonthlyHours: number;
  workHoursPerDay: number;
}

export type AllocationBasis = 'labor' | 'material' | 'units';

export interface IndirectCostItem {
  id: string;
  concept: string;
  monthlyValue: number;
  productionPercentage: number;
  allocationBasis: AllocationBasis;
}

export interface OverheadItem extends IndirectCostItem {}

export interface TransportItem extends IndirectCostItem {}

export interface CapitalItem extends IndirectCostItem {}
