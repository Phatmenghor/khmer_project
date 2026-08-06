"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectUser } from "@/features/auth/store/selectors/auth-selectors";
import { importUsersBatchService, fetchAllCustomersService } from "@/features/auth/store/thunks/users-thunks";
import {
  downloadCustomerTemplate,
  parseCustomerImportFile,
} from "@/utils/excel/customer-excel.utils";
import { mapRowToCreateRequest } from "@/utils/excel/user-excel.utils";
import { GenericExcelImport } from "@/components/shared/import/GenericExcelImport";
import { ImportTableColumn, RowStatus, BaseImportRow } from "@/components/shared/import/types";
import { AppDefault } from "@/constants/app-resource/default/default";
import { ROUTES } from "@/constants/app-routes/routes";
import { resetState } from "@/features/auth/store/slice/customers-slice";
import { parseGender } from "@/utils/genderParser";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { GENDER_OPTIONS } from "@/constants/form-options";

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
  const globalPageSize = useAppSelector(selectGlobalPageSize);
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

      const gender = parseGender(genderVal);

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
    const isValid = !!(row.username && row.password);

    return {
      isValid,
      error: isValid ? undefined : "Required fields (Username, Password) missing.",
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

  const onImportBatch = async (rowsToProcess: ImportCustomerRow[], importId?: string) => {
    const payloads = rowsToProcess.map((row) => {
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

    return await dispatch(importUsersBatchService({ requests: payloads, importId })).unwrap();
  };

  const columns: ImportTableColumn<ImportCustomerRow>[] = [
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
      placeholder: "Gender",
      options: GENDER_OPTIONS,
      width: "120px",
      minWidth: "100px",
    },
  ];

  return (
    <GenericExcelImport<ImportCustomerRow>
      title="Import Customers"
      description="Upload an Excel file to bulk import customers"
      backRoute={ROUTES.ADMIN.CUSTOMERS}
      entityName="customers"
      downloadTemplate={downloadCustomerTemplate}
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
          fetchAllCustomersService({
            search: "",
            pageNo: 1,
            pageSize: globalPageSize,
          })
        );
      }}
    />
  );
}
