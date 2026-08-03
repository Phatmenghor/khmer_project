"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { importBannersBatchService, fetchAllBannerService } from "@/features/master-data/store/thunks/banner-thunks";
import {
  downloadBannerTemplate,
  parseBannerImportFile,
} from "@/utils/excel/banner-excel.utils";
import { GenericExcelImport } from "@/components/shared/import/GenericExcelImport";
import { ImportTableColumn, RowStatus, BaseImportRow } from "@/components/shared/import/types";
import { ROUTES } from "@/constants/app-routes/routes";
import { uploadMultiSize } from "@/services/spaces-service";
import { AppDefault } from "@/constants/app-resource/default/default";
import { resetState } from "@/features/master-data/store/slice/banner-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";

interface ImportBannerRow extends BaseImportRow {
  description: string;
  status: string;
  __imageFile?: File | null;
  __descriptionError?: boolean;
}

export default function BannerImportPage() {
  const dispatch = useAppDispatch();
  const globalPageSize = useAppSelector(selectGlobalPageSize);

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
      if (rawStatus) {
        const cleanStatus = rawStatus.trim().toLowerCase();
        if (
          cleanStatus === "inactive" ||
          cleanStatus === "off" ||
          cleanStatus === "disable" ||
          cleanStatus === "disabled" ||
          cleanStatus === "false" ||
          cleanStatus === "0" ||
          cleanStatus === "no"
        ) {
          status = "INACTIVE";
        }
      }

      return {
        description,
        status,
        __imageFile: null,
        __status: "pending" as RowStatus,
      };
    });

    return { rows: parsedRows, errors };
  };

  const onValidateRow = (row: ImportBannerRow) => {
    const isValid = !!row.__imageFile;

    return {
      isValid,
      error: isValid ? undefined : "Banner Image is required.",
      fieldErrors: {
        __imageFileError: !row.__imageFile,
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

  const onImportBatch = async (rowsToProcess: ImportBannerRow[], importId?: string) => {
    const payloads = [];
    for (const row of rowsToProcess) {
      let imagePayload = { sm: "", md: "", o: "" };
      if (row.__imageFile) {
        try {
          const result = await uploadMultiSize(row.__imageFile, AppDefault.BUSINESS_ID);
          imagePayload = { sm: result.sm.url, md: result.md.url, o: result.o.url };
        } catch (uploadErr) {
          console.error("Failed to upload banner image", row.description, uploadErr);
        }
      }

      payloads.push({
        description: row.description,
        status: row.status,
        image: imagePayload,
      });
    }

    return await dispatch(importBannersBatchService({ requests: payloads, importId })).unwrap();
  };

  const columns: ImportTableColumn<ImportBannerRow>[] = [
    {
      key: "image",
      label: "Image",
      type: "image",
      fieldKey: "__imageFile" as any,
      width: "160px",
      minWidth: "140px",
      isWide: true,
    },
    {
      key: "description",
      label: "Description",
      type: "text",
      required: true,
      fieldKey: "description",
      placeholder: "Banner Description",
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
      onSuccess={() => {
        dispatch(resetState());
        dispatch(
          fetchAllBannerService({
            search: "",
            pageNo: 1,
            pageSize: globalPageSize,
          })
        );
      }}
    />
  );
}
