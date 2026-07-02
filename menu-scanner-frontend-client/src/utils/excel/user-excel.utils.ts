/**
 * User Excel Utilities for E-Menu Client
 * - downloadUserTemplate: generates a blank Excel template with required columns
 * - parseUserImportFile: reads an uploaded Excel and returns row objects
 */

import * as XLSX from "xlsx-js-style";

// ── Column definitions ────────────────────────────────────────────────────────

/** Required fields for simplified user creation */
export const USER_TEMPLATE_COLUMNS = [
  { key: "username",     label: "Username *", required: true },
  { key: "password",     label: "Password *", required: true },
  { key: "role",          label: "Role *", required: true },
  { key: "email",          label: "Email *", required: true },
  { key: "fullName",     label: "Full Name", required: false },
  { key: "phoneNumber",    label: "Phone Number", required: false },
  { key: "gender",         label: "Gender", required: false },
  { key: "dateOfBirth",    label: "Date of Birth", required: false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function autoFitColumns(ws: XLSX.WorkSheet, headers: string[]) {
  const colWidths = headers.map((h) => ({ wch: Math.max(h.length + 4, 18) }));
  ws["!cols"] = colWidths;
}

function styleHeaderRow(ws: XLSX.WorkSheet, headers: string[]) {
  headers.forEach((_, colIdx) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIdx });
    if (!ws[cellAddress]) return;

    // Required columns: Username (index 0), Password (index 1), Role (index 2), Email (index 3)
    const isRequired = colIdx < 4;

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
      }
    };
  });
}

// ── Build Instruction Sheet ───────────────────────────────────────────────────

function buildInstructionSheet(wb: XLSX.WorkBook) {
  const data: any[][] = [];

  // Row 0: Title Block
  data[0] = ["USER BATCH IMPORT INSTRUCTIONS", "", "", ""];
  data[1] = ["", "", "", ""];

  // Row 2: Column definitions section
  data[2] = ["COLUMN DEFINITIONS & REQUIREMENTS", "", "", ""];
  data[3] = ["Column Header", "Required?", "Allowed Format / Value", "Description"];

  // Rows 4-11: Definitions data
  data[4] = ["Username *", "YES", "Letters, numbers, and symbols (e.g. john.doe)", "Unique login identifier for the user."];
  data[5] = ["Password *", "YES", "Min 6 characters", "User account login password."];
  data[6] = ["Role *", "YES", "Staff, Super admin, Cashier, etc.", "Matches database role names. Must specify a valid business role."];
  data[7] = ["Email *", "YES", "valid-email@domain.com", "User's email address."];
  data[8] = ["Full Name", "NO", "First Name + Last Name (e.g. Dara Reach)", "Optional full name. Automatically split into First/Last name on import."];
  data[9] = ["Phone Number", "NO", "Digits only (e.g. 012345678)", "User's contact phone number."];
  data[10] = ["Gender", "NO", "Male / Female / Other", "User's gender classification."];
  data[11] = ["Date of Birth", "NO", "YYYY-MM-DD format (e.g. 1995-06-20)", "User's birthdate format."];

  data[12] = ["", "", "", ""];

  // Row 13: Example section header
  data[13] = ["VALID SPREADSHEET ROW EXAMPLES", "", "", "", "", "", "", ""];
  data[14] = ["Username *", "Password *", "Role *", "Email *", "Full Name", "Phone Number", "Gender", "Date of Birth"];

  // Row 15: Example data (ONLY 1 EXAMPLE ROW as requested)
  data[15] = ["sok.san", "San12345", "Staff", "sok.san@gmail.com", "Sok San", "098765432", "Male", "1990-12-15"];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Layout Merges
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Title block
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } }, // Col defs section
    { s: { r: 13, c: 0 }, e: { r: 13, c: 7 } }, // Examples section
  ];

  // Column Widths
  ws["!cols"] = [
    { wch: 18 }, // A: Header
    { wch: 12 }, // B: Required
    { wch: 38 }, // C: Format
    { wch: 60 }, // D: Description
    { wch: 22 }, // E: Full Name
    { wch: 16 }, // F: Phone
    { wch: 12 }, // G: Gender
    { wch: 15 }, // H: DOB
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
  for (let r = 4; r < 12; r++) {
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
  if (ws["A14"]) {
    ws["A14"].s = {
      fill: { patternType: "solid", fgColor: { rgb: "15803D" } },
      font: { name: "Segoe UI", bold: true, sz: 11, color: { rgb: "FFFFFF" } },
      alignment: { vertical: "center", indent: 1 },
    };
  }

  // 6. Example table header
  for (let c = 0; c < 8; c++) {
    const ref = XLSX.utils.encode_cell({ r: 14, c });
    if (ws[ref]) {
      ws[ref].s = {
        fill: { patternType: "solid", fgColor: { rgb: "E2E8F0" } },
        font: { name: "Segoe UI", bold: true, sz: 9, color: { rgb: "1E293B" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: thinBorder,
      };
    }
  }

  // 7. Example data row (only row 15 is populated)
  const exampleCellStyle = {
    font: { name: "Segoe UI", sz: 9, color: { rgb: "334155" } },
    alignment: { vertical: "center" },
    border: thinBorder,
  };
  for (let c = 0; c < 8; c++) {
    const ref = XLSX.utils.encode_cell({ r: 15, c });
    if (ws[ref]) {
      ws[ref].s = {
        ...exampleCellStyle,
        alignment: {
          horizontal: c === 7 ? "center" : "left",
          vertical: "center",
        },
      };
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, "Instructions & Examples");
}

// ── Download blank template ───────────────────────────────────────────────────

export function downloadUserTemplate() {
  const headers = USER_TEMPLATE_COLUMNS.map((c) => c.label);

  const ws = XLSX.utils.aoa_to_sheet([headers]);
  autoFitColumns(ws, headers);

  // Add auto-filter for the header row (A1 to H1)
  ws["!autofilter"] = { ref: `A1:${XLSX.utils.encode_col(headers.length - 1)}1` };

  // Apply premium colors & styles to headers
  styleHeaderRow(ws, headers);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Users Template");

  // Build the rich styled instructions and examples sheet
  buildInstructionSheet(wb);

  XLSX.writeFile(wb, `user_import_template_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ── Parse uploaded Excel ──────────────────────────────────────────────────────

export interface ParsedUserRow {
  [key: string]: string;
}

export async function parseUserImportFile(file: File): Promise<{
  headers: string[];
  rows: ParsedUserRow[];
  errors: string[];
 }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        // Select correct sheet: prioritize "Users Template" or search for a sheet not named instructions/examples
        let sheetName: string | undefined = wb.SheetNames.find((name) => name === "Users Template");
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

        const rows: ParsedUserRow[] = dataRows
          .filter((row) => row.some((cell) => String(cell).trim() !== ""))
          .map((row, rowIdx) => {
            const rowObj: ParsedUserRow = {};
            headers.forEach((header, colIdx) => {
              rowObj[header] = String(row[colIdx] ?? "").trim();
            });

            // Basic validation: 4 required fields
            const usernameHeader = headers.find((h) => h.toLowerCase().includes("username"));
            const passwordHeader = headers.find((h) => h.toLowerCase().includes("password"));
            const roleHeader = headers.find((h) => h.toLowerCase().includes("role"));
            const emailHeader = headers.find((h) => h.toLowerCase().includes("email"));

            if (usernameHeader && !rowObj[usernameHeader]) {
              errors.push(`Row ${rowIdx + 2}: Username is required.`);
            }
            if (passwordHeader && !rowObj[passwordHeader]) {
              errors.push(`Row ${rowIdx + 2}: Password is required.`);
            }
            if (roleHeader && !rowObj[roleHeader]) {
              errors.push(`Row ${rowIdx + 2}: Role is required.`);
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

/**
 * Maps a parsed Excel row to CreateUserRequest payload.
 */
export function mapRowToCreateRequest(
  row: ParsedUserRow,
  userType: string,
  businessId?: string
): Record<string, unknown> {
  const get = (labelFragment: string): string => {
    const key = Object.keys(row).find((k) => k.toLowerCase().includes(labelFragment.toLowerCase()));
    return key ? row[key] : "";
  };

  const fullName = get("name") || get("full");
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";

  // Normalize gender to UPPERCASE for the backend enum
  const rawGender = get("gender").toUpperCase();
  const gender = ["MALE", "FEMALE", "OTHER"].includes(rawGender) ? rawGender : undefined;

  // Roles format is passed as an array of Role IDs (resolved separately in the page)
  const roleId = get("roleId") || get("role");
  const roles = roleId ? [roleId] : [];

  return {
    userIdentifier: get("username"),
    password:       get("password"),
    firstName:      firstName || undefined,
    lastName:       lastName || undefined,
    email:          get("email") || undefined,
    phoneNumber:    get("phone") || undefined,
    gender,
    dateOfBirth:    get("date of birth") || get("dob") || undefined,
    roles,
    userType,
    ...(businessId ? { businessId } : {}),
  };
}
