import { PlanStatus, MillSettings, PackerSettings } from './types';

export const FLOUR_TYPES: string[] = [
  'All-Purpose',
  'Whole Wheat',
  'Bread Flour',
  'Cake Flour',
  'Rye Flour',
  'Spelt Flour',
  'Semolina',
  'Buckwheat Flour',
  // Users can add more if needed, or this list can be populated from product data
];

export const PLAN_STATUS_OPTIONS: Array<{ value: PlanStatus; label: string }> = [
  { value: PlanStatus.Pending, label: 'Pending' },
  { value: PlanStatus.InProgress, label: 'In Progress' },
  { value: PlanStatus.Completed, label: 'Completed' },
  { value: PlanStatus.Cancelled, label: 'Cancelled' },
];

export const API_KEY_ERROR_MESSAGE = "API_KEY environment variable not set. Please configure it to use AI features.";

export const DEFAULT_MILL_SETTINGS: MillSettings = {
  numberOfMills: 2,
  wheatPerMillPerDayTonnes: 1000,
  extractionRate: 0.75, // Represents 75%
};

export const DEFAULT_PACKER_SETTINGS: PackerSettings = {
  numberOfPackers: 2, // Example: 2 packers
  capacityPerPackerKgPerDay: 40000, // Example: 40 tonnes per packer per day
};

// Expected column headers for Excel import
export const PRODUCTION_PLAN_EXCEL_HEADERS = {
  PLAN_NAME: "Plan Name",
  PRODUCT_NAME: "Product Name",
  FLOUR_TYPE: "Flour Type",
  QUANTITY_KG: "Quantity (kg)",
  START_DATE: "Start Date",
  END_DATE: "End Date",
  STATUS: "Status",
  NOTES: "Notes",
};

export const PRODUCT_SPECS_EXCEL_HEADERS = {
  PRODUCT_NAME: "Product Name",
  PACKAGE_WEIGHT_KG: "Package Weight (kg)",
};
