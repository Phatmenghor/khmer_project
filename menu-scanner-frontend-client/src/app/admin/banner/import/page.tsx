"use client";

import React from "react";
import { useAppDispatch } from "@/store";
import { importBannersBatchService } from "@/features/master-data/store/thunks/banner-thunks";
import {
  downloadBannerTemplate,
  parseBannerImportFile,
} from "@/utils/excel/banner-excel.utils";
import { GenericExcelImport } from "@/components/shared/import/GenericExcelImport";
import { ImportTableColumn, RowStatus, BaseImportRow } from "@/components/shared/import/types";
import { ROUTES } from "@/constants/app-routes/routes";

interface ImportBannerRow extends BaseImportRow {
  description: string;
  status: string;
  __descriptionError?: boolean;
}

export default function BannerImportPage() {
  const dispatch = useAppDispatch();

  const parseFileCallback = async (file: File) => {
    const { rows: r, errors } = await parseBannerImportFile(file);

    const parsedRows: ImportBannerRow[] = r.map((row) => {
      const get = (keys: string[]): string => {
        const matchedKey = Object.keys(row).find((k) =>
          keys.some((key) => k.toLowerCase().includes(key.toLowerCase()))
        );
        return matchedKey ? row[matchedKey] : "";
      };

      const description = get(["description", "desc"]);
      const rawStatus = get(["status"]);

      let status = "ACTIVE";
      const cleanStatus = rawStatus.trim().toUpperCase();
      if (cleanStatus === "INACTIVE" || cleanStatus === "OFF") {
        status = "INACTIVE";
      }

      return {
        description,
        status,
        __status: "pending" as RowStatus,
      };
    });

    return { rows: parsedRows, errors };
  };

  const onValidateRow = (row: ImportBannerRow) => {
    const isValid = !!row.description;

    return {
      isValid,
      error: isValid ? undefined : "Description is required.",
      fieldErrors: {
        __descriptionError: !row.description,
      },
    };
  };

  const determineFieldErrors = (row: ImportBannerRow, msg: string) => {
    const isDuplicate =
      msg.toLowerCase().includes("description") ||
      msg.toLowerCase().includes("already exists") ||
      msg.toLowerCase().includes("duplicate");

    return {
      __descriptionError: isDuplicate,
    };
  };

  const onImportBatch = async (rowsToProcess: ImportBannerRow[]) => {
    const payloads = rowsToProcess.map((row) => ({
      description: row.description,
      status: row.status,
      image: { sm: "", md: "", o: "" }, // Default empty image structure to pass backend validation
    }));

    return await dispatch(importBannersBatchService(payloads)).unwrap();
  };

  const columns: ImportTableColumn<ImportBannerRow>[] = [
    {
      key: "description",
      label: "Description",
      type: "text",
      required: true,
      fieldKey: "description",
      placeholder: "Banner Description",
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      fieldKey: "status",
      placeholder: "Select Status...",
      options: [
        { value: "ACTIVE", label: "Active" },
        { value: "INACTIVE", label: "Inactive" },
      ],
    },
  ];

  return (
    <GenericExcelImport<ImportBannerRow>
      title="Import Banners"
      description="Upload a template spreadsheet to create banners in batch"
      backRoute={ROUTES.ADMIN.BANNER}
      entityName="banners"
      downloadTemplate={downloadBannerTemplate}
      parseFile={parseFileCallback}
      onValidateRow={onValidateRow}
      determineFieldErrors={determineFieldErrors}
      onImportBatch={onImportBatch}
      columns={columns}
      rowIdentifierKey="description"
    />
  );
}
