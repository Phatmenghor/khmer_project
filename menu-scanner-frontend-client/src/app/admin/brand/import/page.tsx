"use client";

import React from "react";
import { useAppDispatch } from "@/store";
import { importBrandsBatchService } from "@/features/master-data/store/thunks/brand-thunks";
import {
  downloadBrandTemplate,
  parseBrandImportFile,
} from "@/utils/excel/brand-excel.utils";
import { GenericExcelImport } from "@/components/shared/import/GenericExcelImport";
import { ImportTableColumn, RowStatus, BaseImportRow } from "@/components/shared/import/types";
import { ROUTES } from "@/constants/app-routes/routes";

interface ImportBrandRow extends BaseImportRow {
  name: string;
  code: string;
  description: string;
  __nameError?: boolean;
}

export default function BrandImportPage() {
  const dispatch = useAppDispatch();

  const parseFileCallback = async (file: File) => {
    const { rows: r, errors } = await parseBrandImportFile(file);

    const parsedRows: ImportBrandRow[] = r.map((row) => {
      const get = (keys: string[]): string => {
        const matchedKey = Object.keys(row).find((k) =>
          keys.some((key) => k.toLowerCase().includes(key.toLowerCase()))
        );
        return matchedKey ? row[matchedKey] : "";
      };

      const name = get(["brand name", "name"]);
      const code = get(["brand code", "code"]);
      const description = get(["description"]);

      return {
        name,
        code,
        description,
        __status: "pending" as RowStatus,
      };
    });

    return { rows: parsedRows, errors };
  };

  const onValidateRow = (row: ImportBrandRow) => {
    const isValid = !!row.name;

    return {
      isValid,
      error: isValid ? undefined : "Brand Name is required.",
      fieldErrors: {
        __nameError: !row.name,
      },
    };
  };

  const determineFieldErrors = (row: ImportBrandRow, msg: string) => {
    const isDuplicate =
      msg.toLowerCase().includes("name") ||
      msg.toLowerCase().includes("already exists") ||
      msg.toLowerCase().includes("duplicate");

    return {
      __nameError: isDuplicate,
    };
  };

  const onImportBatch = async (rowsToProcess: ImportBrandRow[]) => {
    const payloads = rowsToProcess.map((row) => ({
      name: row.name,
      code: row.code || undefined,
      description: row.description || undefined,
    }));

    return await dispatch(importBrandsBatchService(payloads)).unwrap();
  };

  const columns: ImportTableColumn<ImportBrandRow>[] = [
    {
      key: "name",
      label: "Brand Name",
      type: "text",
      required: true,
      fieldKey: "name",
      placeholder: "Brand Name",
    },
    {
      key: "code",
      label: "Brand Code",
      type: "text",
      fieldKey: "code",
      placeholder: "Brand Code",
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
    <GenericExcelImport<ImportBrandRow>
      title="Import Brands"
      description="Upload a template spreadsheet to create item brands in batch"
      backRoute={ROUTES.ADMIN.BRAND}
      entityName="brands"
      downloadTemplate={downloadBrandTemplate}
      parseFile={parseFileCallback}
      onValidateRow={onValidateRow}
      determineFieldErrors={determineFieldErrors}
      onImportBatch={onImportBatch}
      columns={columns}
      rowIdentifierKey="name"
    />
  );
}
