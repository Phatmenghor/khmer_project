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
import { CustomDateTimePicker } from "@/components/shared/common/custom-date-picker";

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
      const normalize = (str: string) =>
        str.toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();

      const normalizedInput = normalize(cleanInput);

      let match = rolesList.find((r) => normalize(r.name) === normalizedInput);
      if (match) return match.name;

      const alphaNum = (str: string) => str.replace(/[^a-z0-9]/g, "");
      const cleanInputAlpha = alphaNum(normalizedInput);
      match = rolesList.find((r) => alphaNum(normalize(r.name)) === cleanInputAlpha);
      if (match) return match.name;

      match = rolesList.find(
        (r) =>
          normalize(r.name).includes(normalizedInput) ||
          normalizedInput.includes(normalize(r.name))
      );
      if (match) return match.name;

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

  const parseFileCallback = async (file: File) => {
    const { rows: r, errors } = await parseUserImportFile(file);

    const parsedRows: ImportRow[] = r.map((row) => {
      const get = (keys: string[]): string => {
        const matchedKey = Object.keys(row).find((k) =>
          keys.some((key) => k.toLowerCase().includes(key.toLowerCase()))
        );
        return matchedKey ? row[matchedKey] : "";
      };

      const username = get(["username", "user"]);
      const password = get(["password", "pass"]);
      const fullName = get(["full name", "fullname", "name"]);
      const email = get(["email"]);
      const phoneNumber = get(["phone number", "phone"]);
      const gender = get(["gender"]);
      const rawDob = get(["date of birth", "dateofbirth", "dob"]);
      const roleText = get(["role name", "role"]);

      const matchedRoleName = resolveRoleId(roleText);

      return {
        username,
        password,
        fullName,
        email,
        phoneNumber,
        gender: gender.toUpperCase() || "MALE",
        dateOfBirth: rawDob,
        role: matchedRoleName || roleText,
        __roleName: matchedRoleName || roleText,
        __status: "pending" as RowStatus,
      };
    });

    return { rows: parsedRows, errors };
  };

  const onValidateRow = (row: ImportRow) => {
    const isUsernameValid = !!row.username;
    const isRoleValid = !!row.role || !!row.__roleName;
    const isValid = isUsernameValid && isRoleValid;

    let error: string | undefined;
    if (!isUsernameValid) error = "Username is required.";
    else if (!isRoleValid) error = "Role is required.";

    return {
      isValid,
      error,
      fieldErrors: {
        __usernameError: !isUsernameValid,
        __roleError: !isRoleValid,
      },
    };
  };

  const determineFieldErrors = (row: ImportRow, msg: string) => {
    const isUsernameDuplicate =
      msg.toLowerCase().includes("username") ||
      msg.toLowerCase().includes("user") ||
      msg.toLowerCase().includes("already exists") ||
      msg.toLowerCase().includes("duplicate");

    const isRoleErr = msg.toLowerCase().includes("role");

    return {
      __usernameError: isUsernameDuplicate,
      __roleError: isRoleErr,
    };
  };

  const onImportBatch = async (rowsToProcess: ImportRow[], importId?: string) => {
    const payloads = rowsToProcess.map((row) => {
      const selectedRole = rolesList.find((r) => r.name === (row.__roleName || row.role));
      const roleId = selectedRole ? selectedRole.id : row.role;

      const parsedUserRow: ParsedUserRow = {
        "Username *": row.username,
        "Password *": row.password,
        "Full Name": row.fullName,
        Email: row.email,
        "Phone Number": row.phoneNumber,
        Gender: row.gender,
        "Date of Birth": row.dateOfBirth,
        "Role Name *": selectedRole?.name || row.role,
      };

      return mapRowToCreateRequest(parsedUserRow, roleId, businessId);
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
      width: "160px",
      minWidth: "130px",
    },
    {
      key: "password",
      label: "Password",
      type: "text",
      required: true,
      fieldKey: "password",
      placeholder: "Password",
      width: "140px",
      minWidth: "120px",
    },
    {
      key: "role",
      label: "Role",
      type: "select",
      required: true,
      fieldKey: "__roleName",
      options: roleOptions,
      placeholder: "Role",
      width: "160px",
      minWidth: "130px",
    },
    {
      key: "fullName",
      label: "Full Name",
      type: "text",
      fieldKey: "fullName",
      placeholder: "Full Name",
      width: "180px",
      minWidth: "140px",
    },
    {
      key: "email",
      label: "Email",
      type: "text",
      fieldKey: "email",
      placeholder: "Email",
      width: "190px",
      minWidth: "150px",
    },
    {
      key: "phoneNumber",
      label: "Phone",
      type: "text",
      fieldKey: "phoneNumber",
      placeholder: "Phone",
      width: "140px",
      minWidth: "110px",
    },
    {
      key: "gender",
      label: "Gender",
      type: "select",
      fieldKey: "gender",
      options: GENDER_OPTIONS,
      placeholder: "Gender",
      width: "120px",
      minWidth: "100px",
    },
    {
      key: "dateOfBirth",
      label: "DOB",
      type: "custom",
      fieldKey: "dateOfBirth",
      width: "160px",
      minWidth: "130px",
      renderCustom: (row, rowIdx, isDisabled, onChange) => (
        <CustomDateTimePicker
          value={row.dateOfBirth}
          onChange={(val) => onChange(val)}
          disabled={isDisabled}
          mode="date"
          placeholder="DOB"
        />
      ),
    },
  ];

  return (
    <GenericExcelImport<ImportRow>
      title="Import Users"
      description="Upload an Excel file to bulk import users"
      backRoute={ROUTES.ADMIN.USERS}
      entityName="users"
      downloadTemplate={downloadUserTemplate}
      parseFile={parseFileCallback}
      onValidateRow={onValidateRow}
      determineFieldErrors={determineFieldErrors}
      onImportBatch={onImportBatch}
      columns={columns}
      rowIdentifierKey="username"
      disableRedirectOnSuccess={true}
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
