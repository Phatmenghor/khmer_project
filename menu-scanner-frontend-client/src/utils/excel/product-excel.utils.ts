/**
 * Product Excel Utilities for E-Menu Client
 * - downloadProductTemplate: generates a styled Excel template with required columns, instructions & sample data
 * - parseProductImportFile: reads an uploaded Excel file and returns row objects with validation
 */

import * as XLSX from "xlsx-js-style";

// ── Column definitions ────────────────────────────────────────────────────────

export const PRODUCT_TEMPLATE_COLUMNS = [
  { key: "name",               label: "Product Name *",      required: true },
  { key: "price",              label: "Price ($) *",        required: true },
  { key: "category",           label: "Category Name *",     required: true },
  { key: "brand",              label: "Brand Name",          required: false },
  { key: "sku",                label: "SKU",                 required: false },
  { key: "barcode",            label: "Barcode",             required: false },
  { key: "description",        label: "Description",         required: false },
  { key: "promotionType",      label: "Promotion Type",      required: false },
  { key: "promotionValue",     label: "Promotion Value",     required: false },
  { key: "promotionFromDate",  label: "Promotion From Date", required: false },
  { key: "promotionToDate",    label: "Promotion To Date",   required: false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function autoFitColumns(ws: XLSX.WorkSheet, headers: string[]) {
  const colWidths = headers.map((h) => ({ wch: Math.max(h.length + 3, 20) }));
  ws["!cols"] = colWidths;
}

function styleHeaderRow(ws: XLSX.WorkSheet, headers: string[]) {
  headers.forEach((_, colIdx) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIdx });
    if (!ws[cellAddress]) return;

    const isRequired = colIdx === 0 || colIdx === 1 || colIdx === 2; // Name, Price & Category are required

    ws[cellAddress].s = {
      fill: {
        patternType: "solid",
        fgColor: { rgb: isRequired ? "967430" : "475569" },
      },
      font: {
        bold: true,
        color: { rgb: "FFFFFF" },
        name: "Segoe UI",
        sz: 11,
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
      border: {
        bottom: { style: "medium", color: { rgb: "1E293B" } },
      },
    };
  });
}

// ── Build Instruction Sheet ───────────────────────────────────────────────────

function buildInstructionSheet(wb: XLSX.WorkBook) {
  const data: any[][] = [];

  data[0] = ["PRODUCT BATCH IMPORT INSTRUCTIONS", "", "", ""];
  data[1] = ["", "", "", ""];

  data[2] = ["COLUMN DEFINITIONS & REQUIREMENTS", "", "", ""];
  data[3] = ["Column Header", "Required?", "Allowed Format / Value", "Description"];

  data[4] = ["Product Name *", "YES", "Text (Letters, numbers, spaces)", "Display name of the product (e.g., Iced Caramel Latte)."];
  data[5] = ["Price ($) *", "YES", "Numeric (e.g., 2.50, 15.00)", "Base unit price of the product."];
  data[6] = ["Category Name *", "YES", "Existing Category Name", "Associated category name (e.g., Coffee, Drinks, Food)."];
  data[7] = ["Brand Name", "NO", "Existing Brand Name", "Associated brand name (e.g., Starbucks, Nestlé)."];
  data[8] = ["SKU", "NO", "Text (e.g., SKU-DRK-001)", "Stock Keeping Unit code."];
  data[9] = ["Barcode", "NO", "Text / Digits (e.g., 885000000001)", "Product barcode number."];
  data[10] = ["Description", "NO", "Text explanation", "Optional short explanation of ingredients or product details."];
  data[11] = ["Promotion Type", "NO", "NONE, PERCENTAGE, FIXED_AMOUNT", "Discount type (Default: NONE)."];
  data[12] = ["Promotion Value", "NO", "Numeric (e.g., 20 for 20%, 2 for $2)", "Discount value."];
  data[13] = ["Promotion From Date", "NO", "YYYY-MM-DD (e.g., 2026-08-01)", "Start date of the promotion."];
  data[14] = ["Promotion To Date", "NO", "YYYY-MM-DD (e.g., 2026-08-31)", "End date of the promotion."];

  data[15] = ["", "", "", ""];

  data[16] = ["VALID SPREADSHEET ROW EXAMPLES", "", "", "", "", "", "", "", "", "", ""];
  data[17] = [
    "Product Name *", "Price ($) *", "Category Name *", "Brand Name", "SKU", "Barcode",
    "Description", "Promotion Type", "Promotion Value", "Promotion From Date", "Promotion To Date"
  ];
  data[18] = [
    "Iced Americano", "2.50", "Coffee", "House Blend", "SKU-DRK-001", "885000000001",
    "Freshly brewed espresso over ice", "PERCENTAGE", "20", "2026-08-01", "2026-08-31"
  ];
  data[19] = [
    "Matcha Latte", "3.75", "Tea", "Uji", "SKU-DRK-002", "885000000002",
    "Premium Japanese green tea with milk", "NONE", "", "", ""
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
    { s: { r: 15, c: 0 }, e: { r: 15, c: 9 } },
  ];

  ws["!cols"] = [
    { wch: 22 },
    { wch: 12 },
    { wch: 32 },
    { wch: 64 },
  ];

  if (ws["A1"]) {
    ws["A1"].s = {
      fill: { patternType: "solid", fgColor: { rgb: "967430" } },
      font: { name: "Segoe UI", bold: true, sz: 14, color: { rgb: "FFFFFF" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  XLSX.utils.book_append_sheet(wb, ws, "Instructions & Examples");
}

// ── Download blank template ───────────────────────────────────────────────────

export function downloadProductTemplate() {
  const headers = PRODUCT_TEMPLATE_COLUMNS.map((c) => c.label);

  const ws = XLSX.utils.aoa_to_sheet([headers]);
  autoFitColumns(ws, headers);

  ws["!autofilter"] = { ref: `A1:${XLSX.utils.encode_col(headers.length - 1)}1` };

  styleHeaderRow(ws, headers);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products Template");

  buildInstructionSheet(wb);

  ws["!views"] = [{ RTL: false }];
  if (wb.Sheets["Instructions & Examples"]) {
    wb.Sheets["Instructions & Examples"]["!views"] = [{ RTL: false }];
  }
  if (!wb.Workbook) wb.Workbook = {};
  if (!wb.Workbook.Views) wb.Workbook.Views = [];
  wb.Workbook.Views[0] = { RTL: false };

  XLSX.writeFile(wb, `product_import_template_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ── Parse uploaded Excel ──────────────────────────────────────────────────────

export interface ParsedProductRow {
  [key: string]: string;
}

export async function parseProductImportFile(file: File): Promise<{
  headers: string[];
  rows: ParsedProductRow[];
  errors: string[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        let sheetName: string | undefined = wb.SheetNames.find((name) => name === "Products Template");
        if (!sheetName) {
          sheetName = wb.SheetNames.find(
            (name) =>
              !name.toLowerCase().includes("instruction") &&
              !name.toLowerCase().includes("example")
          );
        }
        const finalSheetName = sheetName || wb.SheetNames[0];
        const ws = wb.Sheets[finalSheetName];
        const jsonData: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

        if (jsonData.length < 2) {
          return resolve({ headers: [], rows: [], errors: ["File is empty or has no data rows."] });
        }

        const headers = (jsonData[0] as string[]).map((h) => String(h).trim());
        const dataRows = jsonData.slice(1);
        const errors: string[] = [];

        const rows: ParsedProductRow[] = dataRows
          .filter((row) => row.some((cell) => String(cell).trim() !== ""))
          .map((row, rowIdx) => {
            const rowObj: ParsedProductRow = {};
            headers.forEach((header, colIdx) => {
              rowObj[header] = String(row[colIdx] ?? "").trim();
            });

            // Validation
            const nameHeader = headers.find((h) => h.toLowerCase().includes("product name") || h.toLowerCase() === "name");
            const priceHeader = headers.find((h) => h.toLowerCase().includes("price"));
            const categoryHeader = headers.find((h) => h.toLowerCase().includes("category"));

            if (nameHeader && !rowObj[nameHeader]) {
              errors.push(`Row ${rowIdx + 2}: Product Name is required.`);
            }

            if (priceHeader && !rowObj[priceHeader]) {
              errors.push(`Row ${rowIdx + 2}: Price is required.`);
            } else if (priceHeader && isNaN(Number(rowObj[priceHeader]))) {
              errors.push(`Row ${rowIdx + 2}: Price must be a valid number.`);
            }

            if (categoryHeader && !rowObj[categoryHeader]) {
              errors.push(`Row ${rowIdx + 2}: Category is required.`);
            }

            return rowObj;
          });

        resolve({ headers, rows, errors });
      } catch (err) {
        reject(new Error("Failed to parse Excel file. Please ensure it is a valid .xlsx file."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsArrayBuffer(file);
  });
}
