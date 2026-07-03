/**
 * Customer Excel Utilities for E-Menu Client
 * - downloadCustomerTemplate: generates a blank Excel template with required columns
 * - parseCustomerImportFile: reads an uploaded Excel and returns row objects
 */

import * as XLSX from "xlsx-js-style";

// ── Column definitions ────────────────────────────────────────────────────────

export const CUSTOMER_TEMPLATE_COLUMNS = [
  { key: "username",    label: "Username *",    required: true },
  { key: "password",    label: "Password *",    required: true },
  { key: "email",       label: "Email *",       required: true },
  { key: "fullName",    label: "Full Name",     required: false },
  { key: "phoneNumber", label: "Phone Number",  required: false },
  { key: "gender",      label: "Gender",        required: false },
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

    const isRequired = colIdx < 3; // Username, Password, Email are required

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

  // Row 0: Title Block
  data[0] = ["CUSTOMER BATCH IMPORT INSTRUCTIONS", "", "", "", "", ""];
  data[1] = ["", "", "", "", "", ""];

  // Row 2: Column definitions section
  data[2] = ["COLUMN DEFINITIONS & REQUIREMENTS", "", "", "", "", ""];
  data[3] = ["Column Header", "Required?", "Allowed Format / Value", "Description"];

  // Rows 4-9: Definitions data
  data[4] = ["Username *", "YES", "Letters, numbers, and symbols (e.g. john.doe)", "Unique login identifier for the customer."];
  data[5] = ["Password *", "YES", "Min 6 characters", "Customer account login password."];
  data[6] = ["Email *", "YES", "valid-email@domain.com", "Customer's email address."];
  data[7] = ["Full Name", "NO", "First Name + Last Name (e.g. Dara Reach)", "Optional full name. Split into First/Last name on import."];
  data[8] = ["Phone Number", "NO", "Digits only (e.g. 012345678)", "Customer's contact phone number."];
  data[9] = ["Gender", "NO", "Male / Female / Other", "Customer's gender classification."];

  data[10] = ["", "", "", "", "", ""];

  // Row 11: Example section header
  data[11] = ["VALID SPREADSHEET ROW EXAMPLES", "", "", "", "", ""];
  data[12] = ["Username *", "Password *", "Email *", "Full Name", "Phone Number", "Gender"];

  // Row 13: Example data
  data[13] = ["sok.san", "San12345", "sok.san@gmail.com", "Sok San", "098765432", "Male"];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Layout Merges
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Title block
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } }, // Col defs section
    { s: { r: 11, c: 0 }, e: { r: 11, c: 5 } }, // Examples section
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

  // 1. Title cell styling
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
  for (let r = 4; r < 10; r++) {
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
  if (ws["A12"]) {
    ws["A12"].s = {
      fill: { patternType: "solid", fgColor: { rgb: "15803D" } },
      font: { name: "Segoe UI", bold: true, sz: 11, color: { rgb: "FFFFFF" } },
      alignment: { vertical: "center", indent: 1 },
    };
  }

  // 6. Example table header
  for (let c = 0; c < 6; c++) {
    const ref = XLSX.utils.encode_cell({ r: 12, c });
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
  for (let c = 0; c < 6; c++) {
    const ref = XLSX.utils.encode_cell({ r: 13, c });
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

export function downloadCustomerTemplate() {
  const headers = CUSTOMER_TEMPLATE_COLUMNS.map((c) => c.label);

  const ws = XLSX.utils.aoa_to_sheet([headers]);
  autoFitColumns(ws, headers);

  // Add auto-filter for the header row
  ws["!autofilter"] = { ref: `A1:${XLSX.utils.encode_col(headers.length - 1)}1` };

  // Apply styles to headers
  styleHeaderRow(ws, headers);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Customers Template");

  // Build instruction sheet
  buildInstructionSheet(wb);

  XLSX.writeFile(wb, `customer_import_template_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ── Parse uploaded Excel ──────────────────────────────────────────────────────

export interface ParsedCustomerRow {
  [key: string]: string;
}

export async function parseCustomerImportFile(file: File): Promise<{
  headers: string[];
  rows: ParsedCustomerRow[];
  errors: string[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        let sheetName: string | undefined = wb.SheetNames.find((name) => name === "Customers Template");
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

        const rows: ParsedCustomerRow[] = dataRows
          .filter((row) => row.some((cell) => String(cell).trim() !== ""))
          .map((row, rowIdx) => {
            const rowObj: ParsedCustomerRow = {};
            headers.forEach((header, colIdx) => {
              rowObj[header] = String(row[colIdx] ?? "").trim();
            });

            // Basic validation: Username, Password, Email are required
            const usernameHeader = headers.find((h) => h.toLowerCase().includes("username"));
            const passwordHeader = headers.find((h) => h.toLowerCase().includes("password"));
            const emailHeader = headers.find((h) => h.toLowerCase().includes("email"));

            if (usernameHeader && !rowObj[usernameHeader]) {
              errors.push(`Row ${rowIdx + 2}: Username is required.`);
            }
            if (passwordHeader && !rowObj[passwordHeader]) {
              errors.push(`Row ${rowIdx + 2}: Password is required.`);
            }
            if (emailHeader && !rowObj[emailHeader]) {
              errors.push(`Row ${rowIdx + 2}: Email is required.`);
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
