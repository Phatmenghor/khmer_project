"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectUser } from "@/features/auth/store/selectors/auth-selectors";
import { importExchangeRatesBatchService, fetchAllExchangeRateService } from "@/features/master-data/store/thunks/exchange-rate-thunks";
import {
  downloadExchangeRateTemplate,
  parseExchangeRateImportFile,
} from "@/utils/excel/exchange-rate-excel.utils";
import { GenericExcelImport } from "@/components/shared/import/GenericExcelImport";
import { ImportTableColumn, RowStatus, BaseImportRow } from "@/components/shared/import/types";
import { AppDefault } from "@/constants/app-resource/default/default";
import { ROUTES } from "@/constants/app-routes/routes";
import { resetState } from "@/features/master-data/store/slice/exchange-rate-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { BANNER_STATUS_CREATE_UPDATE } from "@/constants/status/create-update-status";

interface ImportExchangeRateRow extends BaseImportRow {
  usdToKhrRate: string;
  status: string;
  remark: string;
  __usdToKhrRateError?: boolean;
}

export default function ExchangeRateImportPage() {
  const dispatch = useAppDispatch();
  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const currentUser = useAppSelector(selectUser);
  const businessId = currentUser?.businessId || AppDefault.BUSINESS_ID;

  const parseFileCallback = async (file: File) => {
    const { rows: r, errors } = await parseExchangeRateImportFile(file);

    const parsedRows: ImportExchangeRateRow[] = r.map((row) => {
      const get = (keys: string[]): string => {
        const matchedKey = Object.keys(row).find((k) =>
          keys.some((key) => k.toLowerCase().includes(key.toLowerCase()))
        );
        return matchedKey ? row[matchedKey] : "";
      };

      const usdToKhrRate = get(["usd to khr rate", "rate", "usd"]);
      const rawStatus = get(["status"]);
      const remark = get(["remark", "notes"]);

      let status = "ACTIVE";
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

      return {
        usdToKhrRate,
        status,
        remark,
        __status: "pending" as RowStatus,
      };
    });

    return { rows: parsedRows, errors };
  };

  const onValidateRow = (row: ImportExchangeRateRow) => {
    const rateNum = parseFloat(row.usdToKhrRate);
    const isValid = !!row.usdToKhrRate && !isNaN(rateNum) && rateNum > 0;

    return {
      isValid,
      error: isValid ? undefined : "USD to KHR Rate must be a valid positive number.",
      fieldErrors: {
        __usdToKhrRateError: !row.usdToKhrRate || isNaN(rateNum) || rateNum <= 0,
      },
    };
  };

  const determineFieldErrors = (row: ImportExchangeRateRow, msg: string) => {
    const isInvalid = msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("number");

    return {
      __usdToKhrRateError: isInvalid,
    };
  };

  const onImportBatch = async (rowsToProcess: ImportExchangeRateRow[], importId?: string) => {
    const payloads = rowsToProcess.map((row) => ({
      usdToKhrRate: parseFloat(row.usdToKhrRate),
      status: row.status || "ACTIVE",
      notes: row.remark || "",
      businessId: businessId,
    }));

    return await dispatch(importExchangeRatesBatchService({ requests: payloads, importId })).unwrap();
  };

  const columns: ImportTableColumn<ImportExchangeRateRow>[] = [
    {
      key: "usdToKhrRate",
      label: "Rate (USD->KHR)",
      type: "text",
      required: true,
      fieldKey: "usdToKhrRate",
      placeholder: "e.g. 4100",
      width: "170px",
      minWidth: "130px",
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      fieldKey: "status",
      placeholder: "Status",
      options: BANNER_STATUS_CREATE_UPDATE,
      width: "130px",
      minWidth: "110px",
    },
    {
      key: "remark",
      label: "Remark",
      type: "text",
      fieldKey: "remark",
      placeholder: "Remark",
      width: "260px",
      minWidth: "180px",
    },
  ];

  return (
    <GenericExcelImport<ImportExchangeRateRow>
      title="Import Exchange Rates"
      description="Upload a template spreadsheet to create business exchange rates in batch"
      backRoute={ROUTES.ADMIN.EXCHANGE_RATE}
      entityName="exchange rates"
      downloadTemplate={downloadExchangeRateTemplate}
      parseFile={parseFileCallback}
      onValidateRow={onValidateRow}
      determineFieldErrors={determineFieldErrors}
      onImportBatch={onImportBatch}
      columns={columns}
      rowIdentifierKey="usdToKhrRate"
      onSuccess={() => {
        dispatch(resetState());
        dispatch(
          fetchAllExchangeRateService({
            search: "",
            pageNo: 1,
            pageSize: globalPageSize,
          })
        );
      }}
    />
  );
}
