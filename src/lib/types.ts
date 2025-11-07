export interface InventoryItem {
  id: string;
  name: string; 
  unit: string;
  purchaseValue: number;
  unitValue: number; 
}

export interface Ingredient {
  inventoryId: string;
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
  id: string;
  name: string;
  batchSize: number;
  recipe: Ingredient[];
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
