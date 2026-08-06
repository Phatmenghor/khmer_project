"use client";

import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { importProductsBatchService, fetchAllProductAdminService } from "@/features/business/store/thunks/product-thunks";
import { fetchAllCategoriesService } from "@/features/master-data/store/thunks/categories-thunks";
import { fetchAllBrandService } from "@/features/master-data/store/thunks/brand-thunks";
import {
  downloadProductTemplate,
  parseProductImportFile,
} from "@/utils/excel/product-excel.utils";
import { GenericExcelImport } from "@/components/shared/import/GenericExcelImport";
import { ImportTableColumn, RowStatus, BaseImportRow } from "@/components/shared/import/types";
import { ROUTES } from "@/constants/app-routes/routes";
import { uploadMultiSize } from "@/services/spaces-service";
import { AppDefault } from "@/constants/app-resource/default/default";
import { resetState } from "@/features/business/store/slice/product-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { ComboboxSelectBrand } from "@/components/shared/combobox/combobox_select_brand";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";
import {
  PROMOTION_TYPE_CREATE_UPDATE,
} from "@/constants/status/create-update-status";
import { CustomDateTimePicker } from "@/components/shared/common/custom-date-picker";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { CustomInputCell, MainImageCell, CoverGalleryCell } from "@/components/shared/import/custom-import-cells";

interface ImportProductRow extends BaseImportRow {
  name: string;
  price: string;
  categoryObj: CategoriesResponseModel | null;
  brandObj: BrandResponseModel | null;
  sku: string;
  barcode: string;
  description: string;
  promotionType: string;
  promotionValue: string;
  promotionFromDate: string;
  promotionToDate: string;
  __mainImageFile?: File | null;
  __coverImageFiles?: File[];
  __nameError?: boolean;
  __priceError?: boolean;
  __categoryError?: boolean;
}

// ── Main Page Component ───────────────────────────────────────────────────────

export default function ProductImportPage() {
  const dispatch = useAppDispatch();
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const [existingCategories, setExistingCategories] = useState<CategoriesResponseModel[]>([]);
  const [existingBrands, setExistingBrands] = useState<BrandResponseModel[]>([]);

  useEffect(() => {
    dispatch(fetchAllCategoriesService({ pageNo: 1, pageSize: 100, search: "" }))
      .unwrap()
      .then((res: any) => {
        const list = res?.content || res?.data || (Array.isArray(res) ? res : []);
        setExistingCategories(list);
      })
      .catch((err) => console.error("Failed to pre-fetch categories for import", err));

    dispatch(fetchAllBrandService({ pageNo: 1, pageSize: 100, search: "" }))
      .unwrap()
      .then((res: any) => {
        const list = res?.content || res?.data || (Array.isArray(res) ? res : []);
        setExistingBrands(list);
      })
      .catch((err) => console.error("Failed to pre-fetch brands for import", err));
  }, [dispatch]);

  const parseFileCallback = async (file: File) => {
    const { rows: r, errors } = await parseProductImportFile(file);

    let catList = existingCategories;
    let brandList = existingBrands;

    if (catList.length === 0) {
      try {
        const res: any = await dispatch(fetchAllCategoriesService({ pageNo: 1, pageSize: 100, search: "" })).unwrap();
        catList = res?.content || res?.data || (Array.isArray(res) ? res : []);
        setExistingCategories(catList);
      } catch (e) {}
    }

    if (brandList.length === 0) {
      try {
        const res: any = await dispatch(fetchAllBrandService({ pageNo: 1, pageSize: 100, search: "" })).unwrap();
        brandList = res?.content || res?.data || (Array.isArray(res) ? res : []);
        setExistingBrands(brandList);
      } catch (e) {}
    }

    const parsedRows: ImportProductRow[] = r.map((row) => {
      const get = (keys: string[]): string => {
        const matchedKey = Object.keys(row).find((k) =>
          keys.some((key) => k.toLowerCase().includes(key.toLowerCase()))
        );
        return matchedKey ? row[matchedKey] : "";
      };

      const name = get(["product name", "name"]);
      const price = get(["price"]);
      const categoryName = get(["category name", "category"]);
      const brandName = get(["brand name", "brand"]);
      const sku = get(["sku", "product sku"]);
      const barcode = get(["barcode", "bar code"]);
      const description = get(["description"]);
      const promotionType = get(["promotion type"]);
      const promotionValue = get(["promotion value"]);
      const promotionFromDate = get(["promotion from date", "from date"]);
      const promotionToDate = get(["promotion to date", "to date"]);

      const cleanCatName = categoryName.trim().toLowerCase();
      const matchedCat = cleanCatName
        ? catList.find((c) => c.name && c.name.trim().toLowerCase() === cleanCatName) || null
        : null;

      const cleanBrandName = brandName.trim().toLowerCase();
      const matchedBrand = cleanBrandName
        ? brandList.find((b) => b.name && b.name.trim().toLowerCase() === cleanBrandName) || null
        : null;

      return {
        name,
        price,
        categoryObj: matchedCat,
        brandObj: matchedBrand,
        sku,
        barcode,
        description,
        promotionType: promotionType || "NONE",
        promotionValue,
        promotionFromDate,
        promotionToDate,
        __mainImageFile: null,
        __coverImageFiles: [],
        __status: "pending" as RowStatus,
      };
    });

    return { rows: parsedRows, errors };
  };

  const onValidateRow = (row: ImportProductRow) => {
    const isNameValid = !!row.name;
    const isPriceValid = !!row.price && !isNaN(Number(row.price));
    const isCategoryValid = Boolean(row.categoryObj?.id || row.categoryObj?.name);

    const hasPromotion = Boolean(row.promotionType && row.promotionType !== "NONE");
    const isPromoValValid = !hasPromotion || (Boolean(row.promotionValue) && !isNaN(Number(row.promotionValue)) && Number(row.promotionValue) > 0);
    const isPromoFromValid = !hasPromotion || Boolean(row.promotionFromDate);
    const isPromoToValid = !hasPromotion || Boolean(row.promotionToDate);

    const isValid = isNameValid && isPriceValid && isCategoryValid && isPromoValValid && isPromoFromValid && isPromoToValid;

    let error: string | undefined;
    if (!isNameValid) error = "Product Name is required.";
    else if (!isPriceValid) error = "Price must be a valid number.";
    else if (!isCategoryValid) error = "Category is required.";
    else if (!isPromoValValid) error = "Promotion Value is required when promotion is enabled.";
    else if (!isPromoFromValid) error = "Promotion From Date is required when promotion is enabled.";
    else if (!isPromoToValid) error = "Promotion To Date is required when promotion is enabled.";

    return {
      isValid,
      error,
      fieldErrors: {
        __nameError: !isNameValid,
        __priceError: !isPriceValid,
        __categoryError: !isCategoryValid,
        __promotionValueError: !isPromoValValid,
        __promotionFromDateError: !isPromoFromValid,
        __promotionToDateError: !isPromoToValid,
      },
    };
  };

  const determineFieldErrors = (row: ImportProductRow, msg: string) => {
    const isNameErr =
      msg.toLowerCase().includes("name") ||
      msg.toLowerCase().includes("already exists") ||
      msg.toLowerCase().includes("duplicate");
    const isPriceErr = msg.toLowerCase().includes("price");
    const isCategoryErr = msg.toLowerCase().includes("category");

    return {
      __nameError: isNameErr,
      __priceError: isPriceErr,
      __categoryError: isCategoryErr,
    };
  };

  const formatIsoDate = (val?: string, isEnd = false) => {
    if (!val) return undefined;
    if (val.includes("T")) return val;
    return isEnd ? `${val}T23:59:59` : `${val}T00:00:00`;
  };

  const onImportBatch = async (
    rowsToProcess: ImportProductRow[],
    importId?: string,
    onProgress?: (stepText: string, percent: number) => void
  ) => {
    // Count total images to upload
    let totalImages = 0;
    rowsToProcess.forEach((r) => {
      if (r.__mainImageFile) totalImages++;
      if (r.__coverImageFiles?.length) totalImages += r.__coverImageFiles.length;
    });

    let uploadedCount = 0;
    const payloads = [];

    for (let i = 0; i < rowsToProcess.length; i++) {
      const row = rowsToProcess[i];
      const imagesPayload: any[] = [];
      let displayOrderCounter = 1;
      let mainImgUrls: any = undefined;

      // 1. Upload Main Image (isPrimary: true)
      if (row.__mainImageFile) {
        uploadedCount++;
        if (onProgress && totalImages > 0) {
          const pct = Math.round((uploadedCount / totalImages) * 45);
          onProgress(`Uploading image ${uploadedCount}/${totalImages} (${row.name})...`, pct);
        }
        try {
          const result = await uploadMultiSize(row.__mainImageFile, AppDefault.BUSINESS_ID);
          mainImgUrls = { sm: result.sm.url, md: result.md.url, o: result.o.url };
          imagesPayload.push({
            image: mainImgUrls,
            imageUrl: mainImgUrls,
            isPrimary: true,
            displayOrder: displayOrderCounter++,
          });
        } catch (uploadErr) {
          console.error("Failed to upload main image", row.name, uploadErr);
        }
      }

      // 2. Upload Cover/Gallery Images (isPrimary: false)
      const coverFiles = row.__coverImageFiles || [];
      for (const coverFile of coverFiles) {
        uploadedCount++;
        if (onProgress && totalImages > 0) {
          const pct = Math.round((uploadedCount / totalImages) * 45);
          onProgress(`Uploading image ${uploadedCount}/${totalImages} (${row.name})...`, pct);
        }
        try {
          const result = await uploadMultiSize(coverFile, AppDefault.BUSINESS_ID);
          const imgUrls = { sm: result.sm.url, md: result.md.url, o: result.o.url };
          if (!mainImgUrls) {
            mainImgUrls = imgUrls;
          }
          imagesPayload.push({
            image: imgUrls,
            imageUrl: imgUrls,
            isPrimary: imagesPayload.length === 0,
            displayOrder: displayOrderCounter++,
          });
        } catch (uploadErr) {
          console.error("Failed to upload cover image", row.name, uploadErr);
        }
      }

      const hasPromotion = row.promotionType && row.promotionType !== "NONE";

      payloads.push({
        name: row.name,
        price: Number(row.price) || 0,
        categoryId: row.categoryObj?.id || undefined,
        brandId: row.brandObj?.id || undefined,
        sku: row.sku || undefined,
        barcode: row.barcode || undefined,
        description: row.description || undefined,
        hasSizes: false,
        mainImage: mainImgUrls,
        images: imagesPayload,
        promotionType: hasPromotion ? row.promotionType : undefined,
        promotionValue: hasPromotion && row.promotionValue ? Number(row.promotionValue) : undefined,
        promotionFromDate: hasPromotion ? formatIsoDate(row.promotionFromDate) : undefined,
        promotionToDate: hasPromotion ? formatIsoDate(row.promotionToDate, true) : undefined,
      });
    }

    if (onProgress) {
      onProgress(`Creating products on server...`, totalImages > 0 ? 50 : 10);
    }

    return await dispatch(importProductsBatchService({ requests: payloads, importId })).unwrap();
  };

  const columns: ImportTableColumn<ImportProductRow>[] = [
    {
      key: "name",
      label: "Name",
      type: "custom",
      required: true,
      fieldKey: "name",
      width: "170px",
      minWidth: "130px",
      renderCustom: (row, rowIdx, isDisabled, onChange) => (
        <CustomInputCell
          value={row.name}
          onChange={onChange}
          disabled={isDisabled}
          placeholder="Product Name"
          hasError={row.__nameError}
        />
      ),
    },
    {
      key: "mainImage",
      label: "Main Image",
      type: "custom",
      fieldKey: "__mainImageFile" as any,
      width: "110px",
      minWidth: "90px",
      renderCustom: (row, rowIdx, isDisabled, onChange) => (
        <MainImageCell
          file={row.__mainImageFile}
          onChange={(file) => onChange(file)}
          disabled={isDisabled}
        />
      ),
    },
    {
      key: "coverImages",
      label: "Gallery (5)",
      type: "custom",
      fieldKey: "__coverImageFiles" as any,
      width: "300px",
      minWidth: "180px",
      renderCustom: (row, rowIdx, isDisabled, onChange) => (
        <CoverGalleryCell
          images={row.__coverImageFiles}
          onChange={(files) => onChange(files)}
          disabled={isDisabled}
        />
      ),
    },
    {
      key: "price",
      label: "Price ($)",
      type: "custom",
      required: true,
      fieldKey: "price",
      width: "100px",
      minWidth: "80px",
      renderCustom: (row, rowIdx, isDisabled, onChange) => (
        <CustomInputCell
          value={row.price}
          onChange={onChange}
          disabled={isDisabled}
          placeholder="Price"
          isDecimalOnly={true}
          hasError={row.__priceError}
        />
      ),
    },
    {
      key: "category",
      label: "Category",
      type: "custom",
      required: true,
      fieldKey: "categoryObj",
      width: "180px",
      minWidth: "150px",
      renderCustom: (row, rowIdx, isDisabled, onChange) => (
        <ComboboxSelectCategories
          dataSelect={row.categoryObj}
          onChangeSelected={(val) => onChange(val)}
          disabled={isDisabled}
          size="sm"
          label=""
          placeholder="Category"
          showAllOption={false}
          error={row.__categoryError ? "Required" : undefined}
        />
      ),
    },
    {
      key: "brand",
      label: "Brand",
      type: "custom",
      fieldKey: "brandObj",
      width: "170px",
      minWidth: "140px",
      renderCustom: (row, rowIdx, isDisabled, onChange) => (
        <ComboboxSelectBrand
          dataSelect={row.brandObj}
          onChangeSelected={(val) => onChange(val)}
          disabled={isDisabled}
          size="sm"
          label=""
          placeholder="Brand"
          showAllOption={false}
        />
      ),
    },
    {
      key: "sku",
      label: "SKU",
      type: "custom",
      fieldKey: "sku",
      width: "140px",
      minWidth: "110px",
      renderCustom: (row, rowIdx, isDisabled, onChange) => (
        <CustomInputCell
          value={row.sku}
          onChange={onChange}
          disabled={isDisabled}
          placeholder="SKU"
        />
      ),
    },
    {
      key: "barcode",
      label: "Barcode",
      type: "custom",
      fieldKey: "barcode",
      width: "140px",
      minWidth: "110px",
      renderCustom: (row, rowIdx, isDisabled, onChange) => (
        <CustomInputCell
          value={row.barcode}
          onChange={onChange}
          disabled={isDisabled}
          placeholder="Barcode"
        />
      ),
    },
    {
      key: "description",
      label: "Description",
      type: "custom",
      fieldKey: "description",
      width: "250px",
      minWidth: "180px",
      renderCustom: (row, rowIdx, isDisabled, onChange) => (
        <CustomInputCell
          value={row.description}
          onChange={onChange}
          disabled={isDisabled}
          placeholder="Description"
        />
      ),
    },
    {
      key: "promotionType",
      label: "Promo Type",
      type: "custom",
      fieldKey: "promotionType",
      width: "150px",
      minWidth: "130px",
      renderCustom: (row, rowIdx, isDisabled, onChange) => (
        <CustomSelect
          size="md"
          options={PROMOTION_TYPE_CREATE_UPDATE}
          value={row.promotionType || "NONE"}
          placeholder="Promo Type"
          onValueChange={(val) => onChange(val)}
          disabled={isDisabled}
          className="h-8 text-xs"
        />
      ),
    },
    {
      key: "promotionValue",
      label: "Promo Value",
      type: "custom",
      fieldKey: "promotionValue",
      width: "120px",
      minWidth: "90px",
      renderCustom: (row, rowIdx, isDisabled, onChange) => {
        const hasPromotion = row.promotionType && row.promotionType !== "NONE";
        if (!hasPromotion) {
          return <span className="text-muted-foreground/40 text-xs px-2 select-none">-</span>;
        }
        return (
          <CustomInputCell
            value={row.promotionValue}
            onChange={onChange}
            disabled={isDisabled}
            placeholder="Value"
            isDecimalOnly={true}
          />
        );
      },
    },
    {
      key: "promotionFromDate",
      label: "Promo From",
      type: "custom",
      fieldKey: "promotionFromDate",
      width: "160px",
      minWidth: "130px",
      renderCustom: (row, rowIdx, isDisabled, onChange) => {
        const hasPromotion = row.promotionType && row.promotionType !== "NONE";
        if (!hasPromotion) {
          return <span className="text-muted-foreground/40 text-xs px-2 select-none">-</span>;
        }
        return (
          <CustomDateTimePicker
            value={row.promotionFromDate}
            onChange={(val) => onChange(val)}
            disabled={isDisabled}
            mode="date"
            placeholder="Start date"
            error={Boolean(row.__promotionFromDateError)}
          />
        );
      },
    },
    {
      key: "promotionToDate",
      label: "Promo To",
      type: "custom",
      fieldKey: "promotionToDate",
      width: "160px",
      minWidth: "130px",
      renderCustom: (row, rowIdx, isDisabled, onChange) => {
        const hasPromotion = row.promotionType && row.promotionType !== "NONE";
        if (!hasPromotion) {
          return <span className="text-muted-foreground/40 text-xs px-2 select-none">-</span>;
        }
        return (
          <CustomDateTimePicker
            value={row.promotionToDate}
            onChange={(val) => onChange(val)}
            disabled={isDisabled}
            mode="date"
            placeholder="End date"
            error={Boolean(row.__promotionToDateError)}
          />
        );
      },
    },
  ];

  return (
    <GenericExcelImport<ImportProductRow>
      title="Import Products"
      description="Upload an Excel file to bulk import products"
      backRoute={ROUTES.ADMIN.PRODUCTS}
      entityName="products"
      downloadTemplate={downloadProductTemplate}
      parseFile={parseFileCallback}
      onValidateRow={onValidateRow}
      determineFieldErrors={determineFieldErrors}
      onImportBatch={onImportBatch}
      columns={columns}
      rowIdentifierKey="name"
      onSuccess={() => {
        dispatch(resetState());
        dispatch(
          fetchAllProductAdminService({
            search: "",
            pageNo: 1,
            pageSize: globalPageSize,
          })
        );
      }}
    />
  );
}
