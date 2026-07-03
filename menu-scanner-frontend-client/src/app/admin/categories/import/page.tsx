"use client";

import React from "react";
import { useAppDispatch } from "@/store";
import { importCategoriesBatchService } from "@/features/master-data/store/thunks/categories-thunks";
import {
  downloadCategoryTemplate,
  parseCategoryImportFile,
} from "@/utils/excel/category-excel.utils";
import { GenericExcelImport } from "@/components/shared/import/GenericExcelImport";
import { ImportTableColumn, RowStatus, BaseImportRow } from "@/components/shared/import/types";
import { ROUTES } from "@/constants/app-routes/routes";

interface ImportCategoryRow extends BaseImportRow {
  name: string;
  code: string;
  description: string;
  __nameError?: boolean;
}

export default function CategoryImportPage() {
  const dispatch = useAppDispatch();

  const parseFileCallback = async (file: File) => {
    const { rows: r, errors } = await parseCategoryImportFile(file);

    const parsedRows: ImportCategoryRow[] = r.map((row) => {
      const get = (keys: string[]): string => {
        const matchedKey = Object.keys(row).find((k) =>
          keys.some((key) => k.toLowerCase().includes(key.toLowerCase()))
        );
        return matchedKey ? row[matchedKey] : "";
      };

      const name = get(["category name", "name"]);
      const code = get(["category code", "code"]);
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

  const onValidateRow = (row: ImportCategoryRow) => {
    const isValid = !!row.name;

    return {
      isValid,
      error: isValid ? undefined : "Category Name is required.",
      fieldErrors: {
        __nameError: !row.name,
      },
    };
  };

  const determineFieldErrors = (row: ImportCategoryRow, msg: string) => {
    const isDuplicate =
      msg.toLowerCase().includes("name") ||
      msg.toLowerCase().includes("already exists") ||
      msg.toLowerCase().includes("duplicate");

    return {
      __nameError: isDuplicate,
    };
  };

  const onImportBatch = async (rowsToProcess: ImportCategoryRow[]) => {
    const payloads = rowsToProcess.map((row) => ({
      name: row.name,
      code: row.code || undefined,
      description: row.description || undefined,
    }));

    return await dispatch(importCategoriesBatchService(payloads)).unwrap();
  };

  const columns: ImportTableColumn<ImportCategoryRow>[] = [
    {
      key: "name",
      label: "Category Name",
      type: "text",
      required: true,
      fieldKey: "name",
      placeholder: "Category Name",
    },
    {
      key: "code",
      label: "Category Code",
      type: "text",
      fieldKey: "code",
      placeholder: "Category Code",
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
    <GenericExcelImport<ImportCategoryRow>
      title="Import Categories"
      description="Upload a template spreadsheet to create item categories in batch"
      backRoute={ROUTES.ADMIN.CATEGORIES}
      entityName="categories"
      downloadTemplate={downloadCategoryTemplate}
      parseFile={parseFileCallback}
      onValidateRow={onValidateRow}
      determineFieldErrors={determineFieldErrors}
      onImportBatch={onImportBatch}
      columns={columns}
      rowIdentifierKey="name"
    />
  );
}
