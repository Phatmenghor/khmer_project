"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { importPaymentOptionsBatchService, fetchAllPaymentOptionsService } from "@/features/master-data/store/thunks/payment-options-thunks";
import {
  downloadPaymentOptionTemplate,
  parsePaymentOptionImportFile,
} from "@/utils/excel/payment-option-excel.utils";
import { GenericExcelImport } from "@/components/shared/import/GenericExcelImport";
import { ImportTableColumn, RowStatus, BaseImportRow } from "@/components/shared/import/types";
import { ROUTES } from "@/constants/app-routes/routes";

import { uploadMultiSize } from "@/services/spaces-service";
import { AppDefault } from "@/constants/app-resource/default/default";
import { resetState } from "@/features/master-data/store/slice/payment-options-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { BANNER_STATUS_CREATE_UPDATE } from "@/constants/status/create-update-status";

interface ImportPaymentOptionRow extends BaseImportRow {
  name: string;
  paymentOptionType: string;
  status: string;
  __imageFile?: File | null;
  __nameError?: boolean;
  __typeError?: boolean;
}

const PAYMENT_TYPE_OPTIONS = [
  { value: "BANK", label: "Bank Transfer" },
  { value: "CASH", label: "Cash" },
];

export default function PaymentOptionImportPage() {
  const dispatch = useAppDispatch();
  const globalPageSize = useAppSelector(selectGlobalPageSize);

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
      const rawType = get(["type", "paymentOptionType"]);
      const rawStatus = get(["status"]);

      let paymentOptionType = "BANK";
      const cleanType = rawType.trim().toUpperCase();
      if (cleanType === "CASH") {
        paymentOptionType = "CASH";
      }

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
        name,
        paymentOptionType,
        status,
        __imageFile: null,
        __status: "pending" as RowStatus,
      };
    });

    return { rows: parsedRows, errors };
  };

  const onValidateRow = (row: ImportPaymentOptionRow) => {
    const hasName = !!row.name;
    const hasType = !!row.paymentOptionType;

    const isValid = hasName && hasType;

    return {
      isValid,
      error: isValid ? undefined : "Required fields (Name, Type) missing.",
      fieldErrors: {
        __nameError: !hasName,
        __typeError: !hasType,
      },
    };
  };

  const determineFieldErrors = (row: ImportPaymentOptionRow, msg: string) => {
    const isDuplicate =
      msg.toLowerCase().includes("name") ||
      msg.toLowerCase().includes("already exists") ||
      msg.toLowerCase().includes("duplicate");

    const isType = msg.toLowerCase().includes("type");

    return {
      __nameError: isDuplicate,
      __typeError: isType,
    };
  };

  const onImportBatch = async (rowsToProcess: ImportPaymentOptionRow[], importId?: string) => {
    const payloads = [];
    for (const row of rowsToProcess) {
      let imagePayload = { sm: "", md: "", o: "" };
      if (row.__imageFile) {
        try {
          const result = await uploadMultiSize(row.__imageFile, AppDefault.BUSINESS_ID);
          imagePayload = { sm: result.sm.url, md: result.md.url, o: result.o.url };
        } catch (uploadErr) {
          console.error("Failed to upload payment option image", row.name, uploadErr);
        }
      }

      payloads.push({
        name: row.name,
        paymentOptionType: row.paymentOptionType || "BANK",
        status: row.status || "ACTIVE",
        image: imagePayload,
      });
    }

    return await dispatch(importPaymentOptionsBatchService({ requests: payloads, importId })).unwrap();
  };

  const columns: ImportTableColumn<ImportPaymentOptionRow>[] = [
    {
      key: "image",
      label: "QR / Logo",
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
      placeholder: "Payment Option Name",
      width: "220px",
      minWidth: "160px",
    },
    {
      key: "type",
      label: "Type",
      type: "select",
      required: true,
      fieldKey: "paymentOptionType",
      placeholder: "Type",
      options: PAYMENT_TYPE_OPTIONS,
      width: "140px",
      minWidth: "110px",
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
      onSuccess={() => {
        dispatch(resetState());
        dispatch(
          fetchAllPaymentOptionsService({
            search: "",
            pageNo: 1,
            pageSize: globalPageSize,
          })
        );
      }}
    />
  );
}
