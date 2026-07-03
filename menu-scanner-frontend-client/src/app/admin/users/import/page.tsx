"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectUser } from "@/features/auth/store/selectors/auth-selectors";
import { selectRolesList } from "@/features/auth/store/selectors/role-selectors";
import { fetchAllRolesListService } from "@/features/auth/store/thunks/role-thunks";
import { importUsersBatchService, fetchAllUsersService } from "@/features/auth/store/thunks/users-thunks";
import {
  downloadUserTemplate,
  parseUserImportFile,
  mapRowToCreateRequest,
  ParsedUserRow,
} from "@/utils/excel/user-excel.utils";
import { GenericExcelImport } from "@/components/shared/import/GenericExcelImport";
import { ImportTableColumn, RowStatus, BaseImportRow } from "@/components/shared/import/types";
import { AppDefault } from "@/constants/app-resource/default/default";
import { UserGropeType } from "@/constants/status/status";
import { GENDER_OPTIONS } from "@/constants/form-options";
import { ROUTES } from "@/constants/app-routes/routes";
import { resetState } from "@/features/auth/store/slice/users-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";

interface ImportRow extends BaseImportRow {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  role: string;
  __roleName?: string;
  __usernameError?: boolean;
  __roleError?: boolean;
}

export default function UserImportPage() {
  const dispatch = useAppDispatch();
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const currentUser = useAppSelector(selectUser);
  const rolesList = useAppSelector(selectRolesList);
  const businessId = currentUser?.businessId || AppDefault.BUSINESS_ID;

  useEffect(() => {
    dispatch(
      fetchAllRolesListService({
        includeAll: false,
        userTypes: [UserGropeType.BUSINESS_USER],
      })
    );
  }, [dispatch]);

  const roleOptions = useMemo(() => {
    return rolesList
      .filter((r) => r.name !== "BUSINESS_OWNER")
      .map((role) => {
        const cleanName = role.name.replace("BUSINESS_", "");
        const formattedLabel =
          cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
        return {
          value: role.name,
          label: formattedLabel,
        };
      });
  }, [rolesList]);

  const resolveRoleId = useCallback(
    (roleText: string) => {
      if (!roleText || !rolesList.length) return "";

      const cleanInput = roleText.trim().toLowerCase();
      // Normalize spaces, underscores, and hyphens to spaces
      const normalize = (str: string) =>
        str.toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();

      const normalizedInput = normalize(cleanInput);

      // 1. Try exact normalized match (e.g. "business admin" === "business admin")
      let match = rolesList.find((r) => normalize(r.name) === normalizedInput);
      if (match) return match.name;

      // 2. Try clean alphanumeric match (e.g. "businessadmin" === "businessadmin")
      const alphaNum = (str: string) => str.replace(/[^a-z0-9]/g, "");
      const cleanInputAlpha = alphaNum(normalizedInput);
      match = rolesList.find((r) => alphaNum(normalize(r.name)) === cleanInputAlpha);
      if (match) return match.name;

      // 3. Try substring match (e.g. "business admin" contains "admin")
      match = rolesList.find(
        (r) =>
          normalize(r.name).includes(normalizedInput) ||
          normalizedInput.includes(normalize(r.name))
      );
      if (match) return match.name;

      // 4. Split into words and match significant keyword (ignoring "business")
      const inputWords = normalizedInput.split(" ").filter((w) => w !== "business" && w.length > 2);
      if (inputWords.length > 0) {
        for (const word of inputWords) {
          match = rolesList.find((r) => {
            const dbWords = normalize(r.name).split(" ").filter((w) => w !== "business");
            return dbWords.some((dbW) => dbW.includes(word) || word.includes(dbW));
          });
          if (match) return match.name;
        }
      }

      return "";
    },
    [rolesList]
  );

  const isDobInvalid = (dob: string) => {
    if (!dob) return false;
    return !dob.match(/^\d{2}-\d{2}-\d{4}$/);
  };

  const normalizeDateOfBirth = (rawDob: string): string => {
    if (!rawDob) return "";
    const clean = rawDob.trim();
    if (clean === "") return "";

    // 1. Matches DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(clean)) {
      return clean;
    }

    // 2. Matches DD-MM-YY, DD/MM/YY, DD-MM-YYYY, or DD/MM/YYYY
    const dmyMatch = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2}|\d{4})$/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, "0");
      const month = dmyMatch[2].padStart(2, "0");
      let year = dmyMatch[3];
      if (year.length === 2) {
        const yr = parseInt(year, 10);
        year = yr >= 40 ? `19${year}` : `20${year}`;
      }
      return `${day}-${month}-${year}`;
    }

    // 3. Matches YYYY-MM-DD, YYYY/MM/DD, YY-MM-DD, or YY/MM/DD
    const ymdMatch = clean.match(/^(\d{2}|\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (ymdMatch) {
      let year = ymdMatch[1];
      if (year.length === 2) {
        const yr = parseInt(year, 10);
        year = yr >= 40 ? `19${year}` : `20${year}`;
      }
      const month = ymdMatch[2].padStart(2, "0");
      const day = ymdMatch[3].padStart(2, "0");
      return `${day}-${month}-${year}`;
    }

    // 4. Check if it's an Excel serial date number (5-digit number for modern dates)
    if (/^\d+$/.test(clean)) {
      const serial = parseInt(clean, 10);
      if (serial >= 10000 && serial <= 99999) {
        const baseDate = new Date(1899, 11, 30);
        const dateObj = new Date(baseDate.getTime() + serial * 24 * 60 * 60 * 1000);
        if (!isNaN(dateObj.getTime())) {
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, "0");
          const day = String(dateObj.getDate()).padStart(2, "0");
          return `${day}-${month}-${year}`;
        }
      }
    }

    // 5. Try JS Date parsing (e.g. for M/D/YY or other formats)
    // Only parse if it's not a pure number to avoid parsing 5-digit zipcodes or serials as years
    if (!/^\d+$/.test(clean)) {
      const parsedTime = Date.parse(clean);
      if (!isNaN(parsedTime)) {
        const dateObj = new Date(parsedTime);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        return `${day}-${month}-${year}`;
      }
    }

    return clean;
  };

  const parseFileCallback = async (file: File) => {
    const { rows: r, errors } = await parseUserImportFile(file);

    const parsedRows: ImportRow[] = r.map((row) => {
      const get = (keys: string[]): string => {
        const matchedKey = Object.keys(row).find((k) =>
          keys.some((key) => k.toLowerCase().includes(key.toLowerCase()))
        );
        return matchedKey ? row[matchedKey] : "";
      };

      const username = get(["username"]);
      const password = get(["password"]);
      const fullName = get(["name", "full"]);
      const email = get(["email"]);
      const phoneNumber = get(["phone", "number"]);
      const genderVal = get(["gender"]);
      const rawDateOfBirth = get(["birth", "dob"]);
      const dateOfBirth = normalizeDateOfBirth(rawDateOfBirth);
      const roleVal = get(["role"]);

      let gender = "";
      const cleanGender = genderVal.trim().toLowerCase();
      const maleSynonyms = ["male", "m", "boy", "man", "ប្រុស"];
      const femaleSynonyms = ["female", "f", "girl", "woman", "ស្រី"];
      const otherSynonyms = ["other", "o"];
      if (maleSynonyms.some(s => cleanGender.includes(s))) {
        gender = "MALE";
      } else if (femaleSynonyms.some(s => cleanGender.includes(s))) {
        gender = "FEMALE";
      } else if (otherSynonyms.includes(cleanGender)) {
        gender = "OTHER";
      }

      const resolvedName = resolveRoleId(roleVal);

      return {
        username,
        password,
        fullName,
        email,
        phoneNumber,
        gender,
        dateOfBirth,
        role: roleVal,
        __status: "pending" as RowStatus,
        __roleName: resolvedName,
      };
    });

    return { rows: parsedRows, errors };
  };

  const onValidateRow = (row: ImportRow) => {
    const dobErr = isDobInvalid(row.dateOfBirth);
    const isValid = !!(
      row.username &&
      row.password &&
      row.email &&
      row.__roleName &&
      !dobErr
    );

    return {
      isValid,
      error: isValid ? undefined : "Required fields missing, or DOB format is invalid.",
      fieldErrors: {
        __usernameError: !row.username,
        __roleError: !row.__roleName,
      },
    };
  };

  const determineFieldErrors = (row: ImportRow, msg: string) => {
    const isDuplicate =
      msg.toLowerCase().includes("username") ||
      msg.toLowerCase().includes("already exists") ||
      msg.toLowerCase().includes("duplicate");
    const isRoleErr = msg.toLowerCase().includes("role");

    return {
      __usernameError: isDuplicate,
      __roleError: isRoleErr,
    };
  };

  const convertDmyToYmd = (dmyStr: string): string => {
    if (!dmyStr) return "";
    const clean = dmyStr.trim();
    const match = clean.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (match) {
      const day = match[1];
      const month = match[2];
      const year = match[3];
      return `${year}-${month}-${day}`;
    }
    return dmyStr;
  };

  const onImportBatch = async (rowsToProcess: ImportRow[], importId?: string) => {
    const payloads = rowsToProcess.map((row) => {
      const mapPayload: ParsedUserRow = {
        username: row.username,
        password: row.password,
        fullName: row.fullName,
        email: row.email,
        phoneNumber: row.phoneNumber,
        gender: row.gender,
        dateOfBirth: convertDmyToYmd(row.dateOfBirth),
        roleId: row.__roleName || "",
      };
      return mapRowToCreateRequest(mapPayload, "BUSINESS_USER", businessId);
    });

    return await dispatch(importUsersBatchService({ requests: payloads, importId })).unwrap();
  };

  const columns: ImportTableColumn<ImportRow>[] = [
    {
      key: "username",
      label: "Username",
      type: "text",
      required: true,
      fieldKey: "username",
      placeholder: "Username",
    },
    {
      key: "password",
      label: "Password",
      type: "text",
      required: true,
      fieldKey: "password",
      placeholder: "Password",
    },
    {
      key: "role",
      label: "Role",
      type: "select",
      required: true,
      fieldKey: "__roleName",
      options: roleOptions,
      placeholder: "Select Role...",
    },
    {
      key: "fullName",
      label: "Full Name",
      type: "text",
      fieldKey: "fullName",
      placeholder: "Full Name",
    },
    {
      key: "email",
      label: "Email",
      type: "text",
      required: true,
      fieldKey: "email",
      placeholder: "Email",
    },
    {
      key: "phoneNumber",
      label: "Phone",
      type: "text",
      fieldKey: "phoneNumber",
      placeholder: "Phone",
    },
    {
      key: "gender",
      label: "Gender",
      type: "select",
      fieldKey: "gender",
      options: GENDER_OPTIONS,
      placeholder: "Gender...",
    },
    {
      key: "dateOfBirth",
      label: "DOB",
      type: "text",
      fieldKey: "dateOfBirth",
      placeholder: "YYYY-MM-DD",
      hasError: (row) => isDobInvalid(row.dateOfBirth),
    },
  ];

  return (
    <GenericExcelImport<ImportRow>
      title="Import Users"
      description="Upload a template spreadsheet to create business users in batch"
      backRoute={ROUTES.ADMIN.USERS}
      entityName="users"
      downloadTemplate={downloadUserTemplate}
      parseFile={parseFileCallback}
      onValidateRow={onValidateRow}
      determineFieldErrors={determineFieldErrors}
      onImportBatch={onImportBatch}
      columns={columns}
      rowIdentifierKey="username"
      onSuccess={() => {
        dispatch(resetState());
        dispatch(
          fetchAllUsersService({
            search: "",
            pageNo: 1,
            pageSize: globalPageSize,
            roles: [],
            userTypes: [UserGropeType.BUSINESS_USER],
            accountStatuses: [],
          })
        );
      }}
    />
  );
}
