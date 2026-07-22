"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectUser } from "@/features/auth/store/selectors/auth-selectors";
import { importRolesBatchService, fetchAllRolesListService } from "@/features/auth/store/thunks/role-thunks";
import {
  downloadRoleTemplate,
  parseRoleImportFile,
} from "@/utils/excel/role-excel.utils";
import { GenericExcelImport } from "@/components/shared/import/GenericExcelImport";
import { ImportTableColumn, RowStatus, BaseImportRow } from "@/components/shared/import/types";
import { AppDefault } from "@/constants/app-resource/default/default";
import { resetState } from "@/features/auth/store/slice/role-slice";
import { UserGropeType } from "@/constants/status/status";

interface ImportRoleRow extends BaseImportRow {
  name: string;
  description: string;
  __nameError?: boolean;
}

export default function RoleImportPage() {
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector(selectUser);
  const businessId = currentUser?.businessId || AppDefault.BUSINESS_ID;

  const parseFileCallback = async (file: File) => {
    const { rows: r, errors } = await parseRoleImportFile(file);

    const parsedRows: ImportRoleRow[] = r.map((row) => {
      const get = (keys: string[]): string => {
        const matchedKey = Object.keys(row).find((k) =>
          keys.some((key) => k.toLowerCase().includes(key.toLowerCase()))
        );
        return matchedKey ? row[matchedKey] : "";
      };

      const name = get(["role name", "name"]);
      const description = get(["description"]);

      return {
        name,
        description,
        __status: "pending" as RowStatus,
      };
    });

    return { rows: parsedRows, errors };
  };

  const onValidateRow = (row: ImportRoleRow) => {
    const isValid = !!row.name;

    return {
      isValid,
      error: isValid ? undefined : "Role Name is required.",
      fieldErrors: {
        __nameError: !row.name,
      },
    };
  };

  const determineFieldErrors = (row: ImportRoleRow, msg: string) => {
    const isDuplicate =
      msg.toLowerCase().includes("name") ||
      msg.toLowerCase().includes("already exists") ||
      msg.toLowerCase().includes("duplicate");

    return {
      __nameError: isDuplicate,
    };
  };

  const onImportBatch = async (rowsToProcess: ImportRoleRow[], importId?: string) => {
    const payloads = rowsToProcess.map((row) => ({
      name: row.name,
      userType: "BUSINESS_USER", // Default to BUSINESS_USER on background
      description: row.description || undefined,
      businessId: businessId,
    }));

    return await dispatch(importRolesBatchService({ requests: payloads, importId })).unwrap();
  };

  const columns: ImportTableColumn<ImportRoleRow>[] = [
    {
      key: "name",
      label: "Role Name",
      type: "text",
      required: true,
      fieldKey: "name",
      placeholder: "Role Name",
    },
    {
      key: "description",
      label: "Description",
      type: "text",
      fieldKey: "description",
      placeholder: "Description",
      width: "400px",
      minWidth: "300px",
    },
  ];

  return (
    <GenericExcelImport<ImportRoleRow>
      title="Import Roles"
      description="Upload a template spreadsheet to create business roles in batch"
      backRoute="/admin/users/roles"
      entityName="roles"
      downloadTemplate={downloadRoleTemplate}
      parseFile={parseFileCallback}
      onValidateRow={onValidateRow}
      determineFieldErrors={determineFieldErrors}
      onImportBatch={onImportBatch}
      columns={columns}
      rowIdentifierKey="name"
      disableRedirectOnSuccess={true}
      onSuccess={() => {
        dispatch(resetState());
        dispatch(
          fetchAllRolesListService({
            includeAll: false,
            userTypes: [UserGropeType.BUSINESS_USER],
          })
        );
      }}
    />
  );
}
