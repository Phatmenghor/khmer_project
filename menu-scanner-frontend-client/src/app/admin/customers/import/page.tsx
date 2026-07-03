"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectUser } from "@/features/auth/store/selectors/auth-selectors";
import { importUsersBatchService } from "@/features/auth/store/thunks/users-thunks";
import {
  downloadCustomerTemplate,
  parseCustomerImportFile,
} from "@/utils/excel/customer-excel.utils";
import { mapRowToCreateRequest } from "@/utils/excel/user-excel.utils";
import { GenericExcelImport } from "@/components/shared/import/GenericExcelImport";
import { ImportTableColumn, RowStatus, BaseImportRow } from "@/components/shared/import/types";
import { AppDefault } from "@/constants/app-resource/default/default";
import { ROUTES } from "@/constants/app-routes/routes";

interface ImportCustomerRow extends BaseImportRow {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  __usernameError?: boolean;
}

export default function CustomerImportPage() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);
  const businessId = currentUser?.businessId || AppDefault.BUSINESS_ID;

  const parseFileCallback = async (file: File) => {
    const { rows: r, errors } = await parseCustomerImportFile(file);

    const parsedRows: ImportCustomerRow[] = r.map((row) => {
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

      let gender = "";
      const cleanGender = genderVal.trim().toLowerCase();
      if (cleanGender === "male" || cleanGender === "m") gender = "MALE";
      else if (cleanGender === "female" || cleanGender === "f") gender = "FEMALE";
      else if (cleanGender === "other" || cleanGender === "o") gender = "OTHER";

      return {
        username,
        password,
        fullName,
        email,
        phoneNumber,
        gender,
        __status: "pending" as RowStatus,
      };
    });

    return { rows: parsedRows, errors };
  };

  const onValidateRow = (row: ImportCustomerRow) => {
    const isValid = !!(
      row.username &&
      row.password &&
      row.email
    );

    return {
      isValid,
      error: isValid ? undefined : "Required fields missing.",
      fieldErrors: {
        __usernameError: !row.username,
      },
    };
  };

  const determineFieldErrors = (row: ImportCustomerRow, msg: string) => {
    const isDuplicate =
      msg.toLowerCase().includes("username") ||
      msg.toLowerCase().includes("already exists") ||
      msg.toLowerCase().includes("duplicate");

    return {
      __usernameError: isDuplicate,
    };
  };

  const onImportBatch = async (rowsToProcess: ImportCustomerRow[]) => {
    const payloads = rowsToProcess.map((row) => {
      // Force customer role and user type, and leave dateOfBirth as undefined
      const mapPayload = {
        username: row.username,
        password: row.password,
        fullName: row.fullName,
        email: row.email,
        phoneNumber: row.phoneNumber,
        gender: row.gender,
        roleId: "CUSTOMER",
      };
      return mapRowToCreateRequest(mapPayload, "CUSTOMER", businessId);
    });

    return await dispatch(importUsersBatchService(payloads)).unwrap();
  };

  const columns: ImportTableColumn<ImportCustomerRow>[] = [
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
      key: "email",
      label: "Email",
      type: "text",
      required: true,
      fieldKey: "email",
      placeholder: "Email Address",
    },
    {
      key: "fullName",
      label: "Full Name",
      type: "text",
      fieldKey: "fullName",
      placeholder: "Full Name",
    },
    {
      key: "phoneNumber",
      label: "Phone Number",
      type: "text",
      fieldKey: "phoneNumber",
      placeholder: "Phone Number",
    },
    {
      key: "gender",
      label: "Gender",
      type: "select",
      fieldKey: "gender",
      placeholder: "Select Gender...",
      options: [
        { value: "MALE", label: "Male" },
        { value: "FEMALE", label: "Female" },
        { value: "OTHER", label: "Other" },
      ],
    },
  ];

  return (
    <GenericExcelImport<ImportCustomerRow>
      title="Import Customers"
      description="Upload a template spreadsheet to create customer profiles in batch"
      backRoute={ROUTES.ADMIN.CUSTOMERS}
      entityName="customers"
      downloadTemplate={downloadCustomerTemplate}
      parseFile={parseFileCallback}
      onValidateRow={onValidateRow}
      determineFieldErrors={determineFieldErrors}
      onImportBatch={onImportBatch}
      columns={columns}
      rowIdentifierKey="username"
    />
  );
}
