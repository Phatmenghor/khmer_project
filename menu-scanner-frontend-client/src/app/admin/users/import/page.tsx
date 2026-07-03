"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectUser } from "@/features/auth/store/selectors/auth-selectors";
import { selectRolesList } from "@/features/auth/store/selectors/role-selectors";
import { fetchAllRolesListService } from "@/features/auth/store/thunks/role-thunks";
import { importUsersBatchService } from "@/features/auth/store/thunks/users-thunks";
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
      const cleanText = roleText.trim().toLowerCase();

      const exact = rolesList.find((r) => r.name.toLowerCase() === cleanText);
      if (exact) return exact.name;

      const contains = rolesList.find(
        (r) =>
          r.name.toLowerCase().includes(cleanText) ||
          cleanText.includes(r.name.toLowerCase())
      );
      if (contains) return contains.name;

      if (cleanText === "super admin" || cleanText === "superadmin") {
        const match = rolesList.find((r) => r.name.toUpperCase().includes("SUPER_ADMIN"));
        if (match) return match.name;
      }

      return "";
    },
    [rolesList]
  );

  const isDobInvalid = (dob: string) => {
    if (!dob) return false;
    return !dob.match(/^\d{4}-\d{2}-\d{2}$/);
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
      const dateOfBirth = get(["birth", "dob"]);
      const roleVal = get(["role"]);

      let gender = "";
      const cleanGender = genderVal.trim().toLowerCase();
      if (cleanGender === "male" || cleanGender === "m") gender = "MALE";
      else if (cleanGender === "female" || cleanGender === "f") gender = "FEMALE";
      else if (cleanGender === "other" || cleanGender === "o") gender = "OTHER";

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

  const onImportBatch = async (rowsToProcess: ImportRow[], importId?: string) => {
    const payloads = rowsToProcess.map((row) => {
      const mapPayload: ParsedUserRow = {
        username: row.username,
        password: row.password,
        fullName: row.fullName,
        email: row.email,
        phoneNumber: row.phoneNumber,
        gender: row.gender,
        dateOfBirth: row.dateOfBirth,
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
    />
  );
}
