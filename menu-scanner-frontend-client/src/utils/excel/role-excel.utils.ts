/**
 * Role Excel Utilities for E-Menu Client
 * - downloadRoleTemplate: generates a blank Excel template with required columns
 * - parseRoleImportFile: reads an uploaded Excel and returns row objects
 */

import * as XLSX from "xlsx-js-style";

// ── Column definitions ────────────────────────────────────────────────────────

export const ROLE_TEMPLATE_COLUMNS = [
  { key: "name",        label: "Role Name *", required: true },
  { key: "description", label: "Description", required: false },
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

    // Required columns: Role Name (index 0)
    const isRequired = colIdx < 1;

    ws[cellAddress].s = {
      fill: {
        patternType: "solid",
        fgColor: { rgb: isRequired ? "967430" : "475569" }, // brand primary colors (967430) for required, Slate-600 for optional
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

  // Row 0: Title Block
  data[0] = ["ROLE BATCH IMPORT INSTRUCTIONS", "", ""];
  data[1] = ["", "", ""];

  // Row 2: Column definitions section
  data[2] = ["COLUMN DEFINITIONS & REQUIREMENTS", "", ""];
  data[3] = ["Column Header", "Required?", "Allowed Format / Value", "Description"];

  // Rows 4-5: Definitions data
  data[4] = ["Role Name *", "YES", "Letters, numbers, and spaces (e.g. Sales Staff)", "Unique name of the role within the business."];
  data[5] = ["Description", "NO", "Text details", "Optional short explanation of role capabilities."];

  data[6] = ["", "", ""];

  // Row 7: Example section header
  data[7] = ["VALID SPREADSHEET ROW EXAMPLES", "", ""];
  data[8] = ["Role Name *", "Description"];

  // Row 9: Example data
  data[9] = ["Cashier Staff", "Staff responsible for handling billing and cash counter tasks."];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Layout Merges
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Title block
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } }, // Col defs section
    { s: { r: 7, c: 0 }, e: { r: 7, c: 1 } }, // Examples section
  ];

  // Column Widths
  ws["!cols"] = [
    { wch: 22 }, // A: Header
    { wch: 12 }, // B: Required
    { wch: 32 }, // C: Format
    { wch: 64 }, // D: Description
  ];

  // Styling Styles
  const thinBorder = {
    top: { style: "thin", color: { rgb: "CBD5E1" } },
    bottom: { style: "thin", color: { rgb: "CBD5E1" } },
    left: { style: "thin", color: { rgb: "CBD5E1" } },
    right: { style: "thin", color: { rgb: "CBD5E1" } },
  };

  // 1. Title cell styling (using primary brand color 967430)
  if (ws["A1"]) {
    ws["A1"].s = {
      fill: { patternType: "solid", fgColor: { rgb: "967430" } },
      font: { name: "Segoe UI", bold: true, sz: 14, color: { rgb: "FFFFFF" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  // 2. Col def title styling
  if (ws["A3"]) {
    ws["A3"].s = {
      fill: { patternType: "solid", fgColor: { rgb: "475569" } },
      font: { name: "Segoe UI", bold: true, sz: 11, color: { rgb: "FFFFFF" } },
      alignment: { vertical: "center", indent: 1 },
    };
  }

  // 3. Col def table header
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

  // 4. Col def data rows
  for (let r = 4; r < 6; r++) {
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

  // 5. Example section title styling
  if (ws["A8"]) {
    ws["A8"].s = {
      fill: { patternType: "solid", fgColor: { rgb: "15803D" } },
      font: { name: "Segoe UI", bold: true, sz: 11, color: { rgb: "FFFFFF" } },
      alignment: { vertical: "center", indent: 1 },
    };
  }

  // 6. Example table header
  for (let c = 0; c < 2; c++) {
    const ref = XLSX.utils.encode_cell({ r: 8, c });
    if (ws[ref]) {
      ws[ref].s = {
        fill: { patternType: "solid", fgColor: { rgb: "E2E8F0" } },
        font: { name: "Segoe UI", bold: true, sz: 9, color: { rgb: "1E293B" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: thinBorder,
      };
    }
  }

  // 7. Example data row
  const exampleCellStyle = {
    font: { name: "Segoe UI", sz: 9, color: { rgb: "334155" } },
    alignment: { vertical: "center" },
    border: thinBorder,
  };
  for (let c = 0; c < 2; c++) {
    const ref = XLSX.utils.encode_cell({ r: 9, c });
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

export function downloadRoleTemplate() {
  const headers = ROLE_TEMPLATE_COLUMNS.map((c) => c.label);

  const ws = XLSX.utils.aoa_to_sheet([headers]);
  autoFitColumns(ws, headers);

  // Add auto-filter for the header row
  ws["!autofilter"] = { ref: `A1:${XLSX.utils.encode_col(headers.length - 1)}1` };

  // Apply styles to headers
  styleHeaderRow(ws, headers);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Roles Template");

  // Build instruction sheet
  buildInstructionSheet(wb);

  XLSX.writeFile(wb, `role_import_template_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ── Parse uploaded Excel ──────────────────────────────────────────────────────

export interface ParsedRoleRow {
  [key: string]: string;
}

export async function parseRoleImportFile(file: File): Promise<{
  headers: string[];
  rows: ParsedRoleRow[];
  errors: string[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        let sheetName: string | undefined = wb.SheetNames.find((name) => name === "Roles Template");
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

        const rows: ParsedRoleRow[] = dataRows
          .filter((row) => row.some((cell) => String(cell).trim() !== ""))
          .map((row, rowIdx) => {
            const rowObj: ParsedRoleRow = {};
            headers.forEach((header, colIdx) => {
              rowObj[header] = String(row[colIdx] ?? "").trim();
            });

            // Basic validation: 1 required field (Role Name)
            const nameHeader = headers.find((h) => h.toLowerCase().includes("role name"));

            if (nameHeader && !rowObj[nameHeader]) {
              errors.push(`Row ${rowIdx + 2}: Role Name is required.`);
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
