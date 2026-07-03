"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectUser } from "@/features/auth/store/selectors/auth-selectors";
import { importDeliveryOptionsBatchService, fetchAllDeliveryOptionsService } from "@/features/master-data/store/thunks/delivery-options-thunks";
import {
  downloadDeliveryOptionTemplate,
  parseDeliveryOptionImportFile,
} from "@/utils/excel/delivery-option-excel.utils";
import { GenericExcelImport } from "@/components/shared/import/GenericExcelImport";
import { ImportTableColumn, RowStatus, BaseImportRow } from "@/components/shared/import/types";
import { AppDefault } from "@/constants/app-resource/default/default";
import { ROUTES } from "@/constants/app-routes/routes";
import { resetState } from "@/features/master-data/store/slice/delivery-options-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";

interface ImportDeliveryOptionRow extends BaseImportRow {
  name: string;
  price: string;
  status: string;
  __nameError?: boolean;
  __priceError?: boolean;
}

export default function DeliveryOptionImportPage() {
  const dispatch = useAppDispatch();
  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const currentUser = useAppSelector(selectUser);
  const businessId = currentUser?.businessId || AppDefault.BUSINESS_ID;

  const parseFileCallback = async (file: File) => {
    const { rows: r, errors } = await parseDeliveryOptionImportFile(file);

    const parsedRows: ImportDeliveryOptionRow[] = r.map((row) => {
      const get = (keys: string[]): string => {
        const matchedKey = Object.keys(row).find((k) =>
          keys.some((key) => k.toLowerCase().includes(key.toLowerCase()))
        );
        return matchedKey ? row[matchedKey] : "";
      };

      const name = get(["delivery option name", "name"]);
      const price = get(["price"]);
      const rawStatus = get(["status"]);

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
        price,
        status,
        __status: "pending" as RowStatus,
      };
    });

    return { rows: parsedRows, errors };
  };

  const onValidateRow = (row: ImportDeliveryOptionRow) => {
    const priceNum = parseFloat(row.price);
    const hasName = !!row.name;
    const hasPrice = !!row.price && !isNaN(priceNum) && priceNum >= 0;

    return {
      isValid: hasName && hasPrice,
      error: hasName && hasPrice ? undefined : "Name is required, and Price must be a positive number.",
      fieldErrors: {
        __nameError: !hasName,
        __priceError: !hasPrice,
      },
    };
  };

  const determineFieldErrors = (row: ImportDeliveryOptionRow, msg: string) => {
    const isDuplicate =
      msg.toLowerCase().includes("name") ||
      msg.toLowerCase().includes("already exists") ||
      msg.toLowerCase().includes("duplicate");

    const isPrice = msg.toLowerCase().includes("price");

    return {
      __nameError: isDuplicate,
      __priceError: isPrice,
    };
  };

  const onImportBatch = async (rowsToProcess: ImportDeliveryOptionRow[], importId?: string) => {
    const payloads = rowsToProcess.map((row) => ({
      name: row.name,
      price: parseFloat(row.price),
      businessId: businessId,
      status: row.status || "ACTIVE",
    }));

    return await dispatch(importDeliveryOptionsBatchService({ requests: payloads, importId })).unwrap();
  };

  const columns: ImportTableColumn<ImportDeliveryOptionRow>[] = [
    {
      key: "name",
      label: "Delivery Option Name",
      type: "text",
      required: true,
      fieldKey: "name",
      placeholder: "Delivery Option Name",
    },
    {
      key: "price",
      label: "Price ($)",
      type: "text",
      required: true,
      fieldKey: "price",
      placeholder: "Price (e.g. 1.50)",
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
    <GenericExcelImport<ImportDeliveryOptionRow>
      title="Import Delivery Options"
      description="Upload a template spreadsheet to create delivery options in batch"
      backRoute={ROUTES.ADMIN.DELIVERY_OPTIONS}
      entityName="delivery options"
      downloadTemplate={downloadDeliveryOptionTemplate}
      parseFile={parseFileCallback}
      onValidateRow={onValidateRow}
      determineFieldErrors={determineFieldErrors}
      onImportBatch={onImportBatch}
      columns={columns}
      rowIdentifierKey="name"
      onSuccess={() => {
        dispatch(resetState());
        dispatch(
          fetchAllDeliveryOptionsService({
            search: "",
            pageNo: 1,
            pageSize: globalPageSize,
          })
        );
      }}
    />
  );
}
