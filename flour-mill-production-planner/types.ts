export enum PlanStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export interface ProductionPlan {
  id: string;
  planName: string;
  productName: string; // Specific product being manufactured
  flourType: string; // General category of flour
  quantityKg: number;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: PlanStatus;
  notes?: string;
  packageWeightKg?: number; // Weight of one saleable unit of this product
  numberOfPackages?: number; // Calculated: quantityKg / packageWeightKg
}

export interface ProductSpecification {
  productName: string;
  packageWeightKg: number;
}

export interface MillSettings {
  numberOfMills: number;
  wheatPerMillPerDayTonnes: number;
  extractionRate: number; // Should be a value like 0.75 for 75%
}

export interface PackerSettings {
  numberOfPackers: number;
  capacityPerPackerKgPerDay: number; // Total capacity for one packer in a day
}
