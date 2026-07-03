"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectUser } from "@/features/auth/store/selectors/auth-selectors";
import { importExchangeRatesBatchService } from "@/features/master-data/store/thunks/exchange-rate-thunks";
import {
  downloadExchangeRateTemplate,
  parseExchangeRateImportFile,
} from "@/utils/excel/exchange-rate-excel.utils";
import { GenericExcelImport } from "@/components/shared/import/GenericExcelImport";
import { ImportTableColumn, RowStatus, BaseImportRow } from "@/components/shared/import/types";
import { AppDefault } from "@/constants/app-resource/default/default";
import { ROUTES } from "@/constants/app-routes/routes";

interface ImportExchangeRateRow extends BaseImportRow {
  usdToKhrRate: string;
  __usdToKhrRateError?: boolean;
}

export default function ExchangeRateImportPage() {
  const dispatch = useAppDispatch();
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

      return {
        usdToKhrRate,
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

  const onImportBatch = async (rowsToProcess: ImportExchangeRateRow[]) => {
    const payloads = rowsToProcess.map((row) => ({
      usdToKhrRate: parseFloat(row.usdToKhrRate),
      businessId: businessId,
    }));

    return await dispatch(importExchangeRatesBatchService(payloads)).unwrap();
  };

  const columns: ImportTableColumn<ImportExchangeRateRow>[] = [
    {
      key: "usdToKhrRate",
      label: "USD to KHR Rate",
      type: "text",
      required: true,
      fieldKey: "usdToKhrRate",
      placeholder: "e.g. 4100",
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
    />
  );
}
