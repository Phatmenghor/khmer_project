/**
 * User Excel Utilities for E-Menu Client
 * - downloadUserTemplate: generates a blank Excel template with required columns
 * - parseUserImportFile: reads an uploaded Excel and returns row objects
 */

import * as XLSX from "xlsx";
import { UserResponseModel } from "@/features/auth/store/models/response/users-response";

// ── Column definitions ────────────────────────────────────────────────────────

/** Required fields for batch user creation (matches CreateUserRequest) */
export const USER_TEMPLATE_COLUMNS = [
  { key: "userIdentifier", label: "Username *", required: true },
  { key: "password",       label: "Password *", required: true },
  { key: "firstName",      label: "First Name *", required: true },
  { key: "lastName",       label: "Last Name *", required: true },
  { key: "email",          label: "Email", required: false },
  { key: "phoneNumber",    label: "Phone Number", required: false },
  { key: "gender",         label: "Gender (MALE/FEMALE/OTHER)", required: false },
  { key: "dateOfBirth",    label: "Date of Birth (YYYY-MM-DD)", required: false },
  { key: "roles",          label: "Roles (comma-separated)", required: false },
  { key: "position",       label: "Position", required: false },
  { key: "department",     label: "Department", required: false },
  { key: "employmentType", label: "Employment Type (FULL_TIME/PART_TIME/CONTRACT)", required: false },
  { key: "joinDate",       label: "Join Date (YYYY-MM-DD)", required: false },
  { key: "shift",          label: "Shift", required: false },
  { key: "remark",         label: "Remark", required: false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function autoFitColumns(ws: XLSX.WorkSheet, headers: string[]) {
  const colWidths = headers.map((h) => ({ wch: Math.max(h.length + 4, 16) }));
  ws["!cols"] = colWidths;
}

function styleHeaderRow(ws: XLSX.WorkSheet, headers: string[]) {
  headers.forEach((_, colIdx) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIdx });
    if (!ws[cellAddress]) return;
    ws[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "EC4899" } }, // pink-500
      alignment: { horizontal: "center" },
    };
  });
}

// ── Download blank template ───────────────────────────────────────────────────

export function downloadUserTemplate() {
  const headers = USER_TEMPLATE_COLUMNS.map((c) => c.label);

  // One example row so users understand the format
  const exampleRow = [
    "john.doe",        // userIdentifier
    "Password@123",   // password
    "John",           // firstName
    "Doe",            // lastName
    "john@email.com", // email
    "012345678",      // phoneNumber
    "MALE",           // gender
    "1990-01-15",     // dateOfBirth
    "STAFF",          // roles
    "Developer",      // position
    "IT",             // department
    "FULL_TIME",      // employmentType
    "2024-01-01",     // joinDate
    "Morning",        // shift
    "",               // remark
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
  autoFitColumns(ws, headers);
  styleHeaderRow(ws, headers);

  // Mark required columns with red font in example row
  USER_TEMPLATE_COLUMNS.forEach((col, colIdx) => {
    if (col.required) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIdx });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          ...ws[cellAddress].s,
          fill: { fgColor: { rgb: "BE185D" } }, // darker pink for required
        };
      }
    }
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Users Template");

  // Add instruction sheet
  const instructionData = [
    ["INSTRUCTION", ""],
    ["", ""],
    ["* Required fields", ""],
    ["Gender values:", "MALE, FEMALE, OTHER"],
    ["Employment Type values:", "FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP"],
    ["Account Status values:", "ACTIVE, INACTIVE"],
    ["Roles:", "Comma-separated role names (e.g. STAFF,MANAGER)"],
    ["Date format:", "YYYY-MM-DD (e.g. 1990-01-15)"],
    ["Password:", "Minimum 6 characters"],
  ];
  const wsInstr = XLSX.utils.aoa_to_sheet(instructionData);
  wsInstr["!cols"] = [{ wch: 28 }, { wch: 48 }];
  XLSX.utils.book_append_sheet(wb, wsInstr, "Instructions");

  XLSX.writeFile(wb, `user_import_template_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ── Parse uploaded Excel ──────────────────────────────────────────────────────

export interface ParsedUserRow {
  [key: string]: string;
}

/**
 * Reads an uploaded .xlsx / .xls file and returns:
 *  - headers: the dynamic column names from the first row
 *  - rows: array of row objects keyed by header name
 *  - errors: any row-level validation messages
 */
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
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
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

            // Validate required fields
            const usernameHeader = headers.find((h) => h.toLowerCase().includes("username"));
            const passwordHeader = headers.find((h) => h.toLowerCase().includes("password"));

            if (usernameHeader && !rowObj[usernameHeader]) {
              errors.push(`Row ${rowIdx + 2}: Username is required.`);
            }
            if (passwordHeader && !rowObj[passwordHeader]) {
              errors.push(`Row ${rowIdx + 2}: Password is required.`);
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
 * Maps a parsed Excel row (using template headers) to a CreateUserRequest payload.
 * Unknown columns are ignored gracefully.
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

  const rolesRaw = get("roles");
  const roles = rolesRaw
    ? rolesRaw.split(",").map((r) => r.trim()).filter(Boolean)
    : ["STAFF"];

  return {
    userIdentifier: get("username"),
    password:       get("password"),
    firstName:      get("first name") || undefined,
    lastName:       get("last name") || undefined,
    email:          get("email") || undefined,
    phoneNumber:    get("phone") || undefined,
    gender:         get("gender") || undefined,
    dateOfBirth:    get("date of birth") || undefined,
    roles,
    position:       get("position") || undefined,
    department:     get("department") || undefined,
    employmentType: get("employment type") || undefined,
    joinDate:       get("join date") || undefined,
    shift:          get("shift") || undefined,
    remark:         get("remark") || undefined,
    userType,
    ...(businessId ? { businessId } : {}),
  };
}
