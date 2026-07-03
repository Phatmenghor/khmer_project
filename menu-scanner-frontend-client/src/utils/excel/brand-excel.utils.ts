/**
 * Brand Excel Utilities for E-Menu Client
 * - downloadBrandTemplate: generates a blank Excel template with required columns
 * - parseBrandImportFile: reads an uploaded Excel and returns row objects
 */

import * as XLSX from "xlsx-js-style";

// ── Column definitions ────────────────────────────────────────────────────────

export const BRAND_TEMPLATE_COLUMNS = [
  { key: "name",        label: "Brand Name *", required: true },
  { key: "code",        label: "Brand Code",   required: false },
  { key: "description", label: "Description",  required: false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function autoFitColumns(ws: XLSX.WorkSheet, headers: string[]) {
  const colWidths = headers.map((h) => ({ wch: Math.max(h.length + 4, 24) }));
  ws["!cols"] = colWidths;
}

function styleHeaderRow(ws: XLSX.WorkSheet, headers: string[]) {
  headers.forEach((_, colIdx) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIdx });
    if (!ws[cellAddress]) return;

    const isRequired = colIdx === 0; // Brand Name is required

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

  data[0] = ["BRAND BATCH IMPORT INSTRUCTIONS", "", "", ""];
  data[1] = ["", "", "", ""];

  data[2] = ["COLUMN DEFINITIONS & REQUIREMENTS", "", "", ""];
  data[3] = ["Column Header", "Required?", "Allowed Format / Value", "Description"];

  data[4] = ["Brand Name *", "YES", "Letters, numbers, and spaces", "The name of the brand (e.g. Coca-Cola, Heinz)."];
  data[5] = ["Brand Code", "NO", "Alphanumeric shortcode (e.g. COKE, HNZ)", "Short code used for quick reference."];
  data[6] = ["Description", "NO", "Short text description", "Optional brief explanation of the brand details."];

  data[7] = ["", "", "", ""];

  data[8] = ["VALID SPREADSHEET ROW EXAMPLES", "", "", ""];
  data[9] = ["Brand Name *", "Brand Code", "Description"];
  data[10] = ["Coca-Cola Company", "COKE", "Global soft drink manufacturer"];

  const ws = XLSX.utils.aoa_to_sheet(data);

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
    { s: { r: 8, c: 0 }, e: { r: 8, c: 2 } },
  ];

  ws["!cols"] = [
    { wch: 22 },
    { wch: 12 },
    { wch: 32 },
    { wch: 64 },
  ];

  const thinBorder = {
    top: { style: "thin", color: { rgb: "CBD5E1" } },
    bottom: { style: "thin", color: { rgb: "CBD5E1" } },
    left: { style: "thin", color: { rgb: "CBD5E1" } },
    right: { style: "thin", color: { rgb: "CBD5E1" } },
  };

  if (ws["A1"]) {
    ws["A1"].s = {
      fill: { patternType: "solid", fgColor: { rgb: "967430" } },
      font: { name: "Segoe UI", bold: true, sz: 14, color: { rgb: "FFFFFF" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  if (ws["A3"]) {
    ws["A3"].s = {
      fill: { patternType: "solid", fgColor: { rgb: "475569" } },
      font: { name: "Segoe UI", bold: true, sz: 11, color: { rgb: "FFFFFF" } },
      alignment: { vertical: "center", indent: 1 },
    };
  }

  for (let c = 0; c < 4; c++) {
    const ref = XLSX.utils.encode_cell({ r: 3, c });
    if (ws[ref]) {
      ws[ref].s = {
        fill: { patternType: "solid", fgColor: { rgb: "E2E8F0" } },
        font: { name: "Segoe UI", bold: true, sz: 10, color: { rgb: "1E293B" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: thinBorder,
      };
    }
  }

  for (let r = 4; r < 7; r++) {
    for (let c = 0; c < 4; c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (!ws[ref]) continue;

      const isReqCol = c === 1;
      const isYes = ws[ref].v === "YES";

      ws[ref].s = {
        font: {
          name: "Segoe UI",
          sz: 10,
          bold: isReqCol,
          color: isReqCol ? { rgb: isYes ? "967430" : "64748B" } : { rgb: "1E293B" },
        },
        alignment: {
          horizontal: c === 1 ? "center" : "left",
          vertical: "center",
        },
        border: thinBorder,
      };
    }
  }

  if (ws["A9"]) {
    ws["A9"].s = {
      fill: { patternType: "solid", fgColor: { rgb: "15803D" } },
      font: { name: "Segoe UI", bold: true, sz: 11, color: { rgb: "FFFFFF" } },
      alignment: { vertical: "center", indent: 1 },
    };
  }

  for (let c = 0; c < 3; c++) {
    const ref = XLSX.utils.encode_cell({ r: 9, c });
    if (ws[ref]) {
      ws[ref].s = {
        fill: { patternType: "solid", fgColor: { rgb: "E2E8F0" } },
        font: { name: "Segoe UI", bold: true, sz: 9, color: { rgb: "1E293B" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: thinBorder,
      };
    }
  }

  const exampleCellStyle = {
    font: { name: "Segoe UI", sz: 9, color: { rgb: "334155" } },
    alignment: { vertical: "center" },
    border: thinBorder,
  };
  for (let c = 0; c < 3; c++) {
    const ref = XLSX.utils.encode_cell({ r: 10, c });
    if (ws[ref]) {
      ws[ref].s = {
        ...exampleCellStyle,
        alignment: {
          horizontal: "left",
          vertical: "center",
        },
      };
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, "Instructions & Examples");
}

// ── Download blank template ───────────────────────────────────────────────────

export function downloadBrandTemplate() {
  const headers = BRAND_TEMPLATE_COLUMNS.map((c) => c.label);

  const ws = XLSX.utils.aoa_to_sheet([headers]);
  autoFitColumns(ws, headers);

  ws["!autofilter"] = { ref: `A1:${XLSX.utils.encode_col(headers.length - 1)}1` };

  styleHeaderRow(ws, headers);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Brands Template");

  buildInstructionSheet(wb);

  XLSX.writeFile(wb, `brand_import_template_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ── Parse uploaded Excel ──────────────────────────────────────────────────────

export interface ParsedBrandRow {
  [key: string]: string;
}

export async function parseBrandImportFile(file: File): Promise<{
  headers: string[];
  rows: ParsedBrandRow[];
  errors: string[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        let sheetName: string | undefined = wb.SheetNames.find((name) => name === "Brands Template");
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

        const rows: ParsedBrandRow[] = dataRows
          .filter((row) => row.some((cell) => String(cell).trim() !== ""))
          .map((row, rowIdx) => {
            const rowObj: ParsedBrandRow = {};
            headers.forEach((header, colIdx) => {
              rowObj[header] = String(row[colIdx] ?? "").trim();
            });

            // Basic validation: Name is required
            const nameHeader = headers.find((h) => h.toLowerCase().includes("brand name"));

            if (nameHeader && !rowObj[nameHeader]) {
              errors.push(`Row ${rowIdx + 2}: Brand Name is required.`);
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
