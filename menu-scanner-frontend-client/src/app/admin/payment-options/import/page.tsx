"use client";

import React from "react";
import { useAppDispatch } from "@/store";
import { importPaymentOptionsBatchService } from "@/features/master-data/store/thunks/payment-options-thunks";
import {
  downloadPaymentOptionTemplate,
  parsePaymentOptionImportFile,
} from "@/utils/excel/payment-option-excel.utils";
import { GenericExcelImport } from "@/components/shared/import/GenericExcelImport";
import { ImportTableColumn, RowStatus, BaseImportRow } from "@/components/shared/import/types";
import { ROUTES } from "@/constants/app-routes/routes";

interface ImportPaymentOptionRow extends BaseImportRow {
  name: string;
  provider: string;
  accountNumber: string;
  accountName: string;
  description: string;
  __nameError?: boolean;
  __providerError?: boolean;
  __accountNumberError?: boolean;
  __accountNameError?: boolean;
}

export default function PaymentOptionImportPage() {
  const dispatch = useAppDispatch();

  const parseFileCallback = async (file: File) => {
    const { rows: r, errors } = await parsePaymentOptionImportFile(file);

    const parsedRows: ImportPaymentOptionRow[] = r.map((row) => {
      const get = (keys: string[]): string => {
        const matchedKey = Object.keys(row).find((k) =>
          keys.some((key) => k.toLowerCase().includes(key.toLowerCase()))
        );
        return matchedKey ? row[matchedKey] : "";
      };

      const name = get(["payment option name", "name"]);
      const provider = get(["provider"]);
      const accountNumber = get(["account number", "number"]);
      const accountName = get(["account name", "name"]);
      const description = get(["description"]);

      return {
        name,
        provider,
        accountNumber,
        accountName,
        description,
        __status: "pending" as RowStatus,
      };
    });

    return { rows: parsedRows, errors };
  };

  const onValidateRow = (row: ImportPaymentOptionRow) => {
    const hasName = !!row.name;
    const hasProvider = !!row.provider;
    const hasNumber = !!row.accountNumber;
    const hasAccName = !!row.accountName;

    const isValid = hasName && hasProvider && hasNumber && hasAccName;

    return {
      isValid,
      error: isValid ? undefined : "Required fields (Name, Provider, Account Number, Account Name) missing.",
      fieldErrors: {
        __nameError: !hasName,
        __providerError: !hasProvider,
        __accountNumberError: !hasNumber,
        __accountNameError: !hasAccName,
      },
    };
  };

  const determineFieldErrors = (row: ImportPaymentOptionRow, msg: string) => {
    const isDuplicate =
      msg.toLowerCase().includes("name") ||
      msg.toLowerCase().includes("already exists") ||
      msg.toLowerCase().includes("duplicate");

    const isProvider = msg.toLowerCase().includes("provider");
    const isNumber = msg.toLowerCase().includes("number") || msg.toLowerCase().includes("account");
    const isAccName = msg.toLowerCase().includes("account name") || msg.toLowerCase().includes("holder");

    return {
      __nameError: isDuplicate,
      __providerError: isProvider,
      __accountNumberError: isNumber,
      __accountNameError: isAccName,
    };
  };

  const onImportBatch = async (rowsToProcess: ImportPaymentOptionRow[]) => {
    const payloads = rowsToProcess.map((row) => ({
      name: row.name,
      paymentOptionType: "BANK_TRANSFER", // Default value
      provider: row.provider,
      accountNumber: row.accountNumber,
      accountName: row.accountName,
      description: row.description || undefined,
      status: "ACTIVE",
    }));

    return await dispatch(importPaymentOptionsBatchService(payloads)).unwrap();
  };

  const columns: ImportTableColumn<ImportPaymentOptionRow>[] = [
    {
      key: "name",
      label: "Payment Option Name",
      type: "text",
      required: true,
      fieldKey: "name",
      placeholder: "Payment Option Name",
    },
    {
      key: "provider",
      label: "Provider",
      type: "text",
      required: true,
      fieldKey: "provider",
      placeholder: "Provider (e.g. ABA)",
    },
    {
      key: "accountNumber",
      label: "Account Number",
      type: "text",
      required: true,
      fieldKey: "accountNumber",
      placeholder: "Account Number",
    },
    {
      key: "accountName",
      label: "Account Name",
      type: "text",
      required: true,
      fieldKey: "accountName",
      placeholder: "Account Name",
    },
    {
      key: "description",
      label: "Description",
      type: "text",
      fieldKey: "description",
      placeholder: "Description",
      width: "300px",
      minWidth: "200px",
    },
  ];

  return (
    <GenericExcelImport<ImportPaymentOptionRow>
      title="Import Payment Options"
      description="Upload a template spreadsheet to create payment options in batch"
      backRoute={ROUTES.ADMIN.PAYMENT_OPTIONS}
      entityName="payment options"
      downloadTemplate={downloadPaymentOptionTemplate}
      parseFile={parseFileCallback}
      onValidateRow={onValidateRow}
      determineFieldErrors={determineFieldErrors}
      onImportBatch={onImportBatch}
      columns={columns}
      rowIdentifierKey="name"
    />
  );
}
