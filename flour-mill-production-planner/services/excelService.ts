import * as XLSX from 'xlsx';
import { ProductionPlan, ProductSpecification, PlanStatus } from '../types';
import { PRODUCTION_PLAN_EXCEL_HEADERS, PRODUCT_SPECS_EXCEL_HEADERS } from '../constants';

// Helper to parse Excel dates (which can be numbers or strings)
const parseExcelDate = (excelDate: any): string | undefined => {
  if (typeof excelDate === 'number') {
    // XLSX uses numbers for dates (days since 1900 or 1904)
    const date = XLSX.SSF.parse_date_code(excelDate);
    if (date) {
      return new Date(date.y, date.m - 1, date.d, date.H || 0, date.M || 0, date.S || 0).toISOString();
    }
  } else if (typeof excelDate === 'string') {
    // Try to parse if it's a date string
    const parsed = new Date(excelDate);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return undefined; // Or throw an error, or return a default
};


export const parseProductionPlanExcel = async (file: File): Promise<Partial<ProductionPlan>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("Failed to read file data."));
          return;
        }
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        const plans: Partial<ProductionPlan>[] = jsonData.map((row, index) => {
          const startDate = parseExcelDate(row[PRODUCTION_PLAN_EXCEL_HEADERS.START_DATE]);
          const endDate = parseExcelDate(row[PRODUCTION_PLAN_EXCEL_HEADERS.END_DATE]);

          if (!row[PRODUCTION_PLAN_EXCEL_HEADERS.PRODUCT_NAME]) {
            console.warn(`Row ${index + 2} in Production Plan Excel is missing 'Product Name'. Skipping.`);
            return null;
          }
          if (!row[PRODUCTION_PLAN_EXCEL_HEADERS.QUANTITY_KG] || isNaN(parseFloat(row[PRODUCTION_PLAN_EXCEL_HEADERS.QUANTITY_KG]))) {
             console.warn(`Row ${index + 2} in Production Plan Excel has invalid or missing 'Quantity (kg)'. Skipping.`);
            return null;
          }
           if (!startDate) {
            console.warn(`Row ${index + 2} in Production Plan Excel has invalid or missing 'Start Date'. Skipping.`);
            return null;
          }
          if (!endDate) {
            console.warn(`Row ${index + 2} in Production Plan Excel has invalid or missing 'End Date'. Skipping.`);
            return null;
          }


          const plan: Partial<ProductionPlan> = {
            planName: row[PRODUCTION_PLAN_EXCEL_HEADERS.PLAN_NAME]?.toString() || `${row[PRODUCTION_PLAN_EXCEL_HEADERS.PRODUCT_NAME]} - ${new Date().toLocaleDateString()}`,
            productName: row[PRODUCTION_PLAN_EXCEL_HEADERS.PRODUCT_NAME]?.toString(),
            flourType: row[PRODUCTION_PLAN_EXCEL_HEADERS.FLOUR_TYPE]?.toString() || 'N/A',
            quantityKg: parseFloat(row[PRODUCTION_PLAN_EXCEL_HEADERS.QUANTITY_KG]),
            startDate: startDate,
            endDate: endDate,
            status: (row[PRODUCTION_PLAN_EXCEL_HEADERS.STATUS] as PlanStatus) || PlanStatus.Pending,
            notes: row[PRODUCTION_PLAN_EXCEL_HEADERS.NOTES]?.toString() || '',
          };
          return plan;
        }).filter(plan => plan !== null) as Partial<ProductionPlan>[];
        resolve(plans);
      } catch (error) {
        console.error("Error parsing production plan Excel:", error);
        reject(error);
      }
    };
    reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
};

export const parseProductSpecificationsExcel = async (file: File): Promise<ProductSpecification[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
         if (!data) {
          reject(new Error("Failed to read file data."));
          return;
        }
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        const specs: ProductSpecification[] = jsonData.map((row, index) => {
          if (!row[PRODUCT_SPECS_EXCEL_HEADERS.PRODUCT_NAME]) {
            console.warn(`Row ${index + 2} in Product Specs Excel is missing 'Product Name'. Skipping.`);
            return null;
          }
          if (!row[PRODUCT_SPECS_EXCEL_HEADERS.PACKAGE_WEIGHT_KG] || isNaN(parseFloat(row[PRODUCT_SPECS_EXCEL_HEADERS.PACKAGE_WEIGHT_KG]))) {
            console.warn(`Row ${index + 2} in Product Specs Excel has invalid or missing 'Package Weight (kg)'. Skipping.`);
            return null;
          }
          return {
            productName: row[PRODUCT_SPECS_EXCEL_HEADERS.PRODUCT_NAME].toString(),
            packageWeightKg: parseFloat(row[PRODUCT_SPECS_EXCEL_HEADERS.PACKAGE_WEIGHT_KG]),
          };
        }).filter(spec => spec !== null) as ProductSpecification[];
        resolve(specs);
      } catch (error) {
        console.error("Error parsing product specifications Excel:", error);
        reject(error);
      }
    };
     reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
};
