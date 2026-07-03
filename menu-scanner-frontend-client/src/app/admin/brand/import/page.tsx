"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { importBrandsBatchService, fetchAllBrandService } from "@/features/master-data/store/thunks/brand-thunks";
import {
  downloadBrandTemplate,
  parseBrandImportFile,
} from "@/utils/excel/brand-excel.utils";
import { GenericExcelImport } from "@/components/shared/import/GenericExcelImport";
import { ImportTableColumn, RowStatus, BaseImportRow } from "@/components/shared/import/types";
import { ROUTES } from "@/constants/app-routes/routes";
import { uploadMultiSize } from "@/services/spaces-service";
import { AppDefault } from "@/constants/app-resource/default/default";
import { resetState } from "@/features/master-data/store/slice/brand-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";

interface ImportBrandRow extends BaseImportRow {
  name: string;
  description: string;
  __imageFile?: File | null;
  __nameError?: boolean;
}

export default function BrandImportPage() {
  const dispatch = useAppDispatch();
  const globalPageSize = useAppSelector(selectGlobalPageSize);

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

  const onImportBatch = async (rowsToProcess: ImportBrandRow[], importId?: string) => {
    const payloads = [];
    for (const row of rowsToProcess) {
      let imagePayload = { sm: "", md: "", o: "" };
      if (row.__imageFile) {
        try {
          const result = await uploadMultiSize(row.__imageFile, AppDefault.BUSINESS_ID);
          imagePayload = { sm: result.sm.url, md: result.md.url, o: result.o.url };
        } catch (uploadErr) {
          console.error("Failed to upload brand image", row.name, uploadErr);
        }
      }

      payloads.push({
        name: row.name,
        image: imagePayload,
        description: row.description || undefined,
      });
    }

    return await dispatch(importBrandsBatchService({ requests: payloads, importId })).unwrap();
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
      key: "image",
      label: "Brand Image",
      type: "image",
      fieldKey: "__imageFile" as any,
      width: "120px",
      minWidth: "100px",
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
      onSuccess={() => {
        dispatch(resetState());
        dispatch(
          fetchAllBrandService({
            search: "",
            pageNo: 1,
            pageSize: globalPageSize,
          })
        );
      }}
    />
  );
}
