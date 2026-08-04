"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { importCategoriesBatchService, fetchAllCategoriesService } from "@/features/master-data/store/thunks/categories-thunks";
import {
  downloadCategoryTemplate,
  parseCategoryImportFile,
} from "@/utils/excel/category-excel.utils";
import { GenericExcelImport } from "@/components/shared/import/GenericExcelImport";
import { ImportTableColumn, RowStatus, BaseImportRow } from "@/components/shared/import/types";
import { ROUTES } from "@/constants/app-routes/routes";
import { uploadMultiSize } from "@/services/spaces-service";
import { AppDefault } from "@/constants/app-resource/default/default";
import { resetState } from "@/features/master-data/store/slice/categories-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";

interface ImportCategoryRow extends BaseImportRow {
  name: string;
  description: string;
  __imageFile?: File | null;
  __nameError?: boolean;
}

export default function CategoryImportPage() {
  const dispatch = useAppDispatch();
  const globalPageSize = useAppSelector(selectGlobalPageSize);

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
      const description = get(["description"]);

      return {
        name,
        description,
        __imageFile: null,
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

  const onImportBatch = async (rowsToProcess: ImportCategoryRow[], importId?: string) => {
    const payloads = [];
    for (const row of rowsToProcess) {
      let imagePayload = { sm: "", md: "", o: "" };
      if (row.__imageFile) {
        try {
          const result = await uploadMultiSize(row.__imageFile, AppDefault.BUSINESS_ID);
          imagePayload = { sm: result.sm.url, md: result.md.url, o: result.o.url };
        } catch (uploadErr) {
          console.error("Failed to upload category image", row.name, uploadErr);
        }
      }

      payloads.push({
        name: row.name,
        image: imagePayload,
        description: row.description || undefined,
      });
    }

    return await dispatch(importCategoriesBatchService({ requests: payloads, importId })).unwrap();
  };

  const columns: ImportTableColumn<ImportCategoryRow>[] = [
    {
      key: "image",
      label: "Icon",
      type: "image",
      fieldKey: "__imageFile" as any,
      width: "140px",
      minWidth: "110px",
    },
    {
      key: "name",
      label: "Name",
      type: "text",
      required: true,
      fieldKey: "name",
      placeholder: "Category Name",
      width: "220px",
      minWidth: "160px",
    },
    {
      key: "description",
      label: "Description",
      type: "text",
      fieldKey: "description",
      placeholder: "Description",
      width: "280px",
      minWidth: "180px",
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
      onSuccess={() => {
        dispatch(resetState());
        dispatch(
          fetchAllCategoriesService({
            search: "",
            pageNo: 1,
            pageSize: globalPageSize,
          })
        );
      }}
    />
  );
}
