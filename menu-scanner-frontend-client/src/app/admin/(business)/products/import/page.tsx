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
  PRODUCT_STOCK_STATUS_CREATE_UPDATE,
} from "@/constants/status/create-update-status";
import { CustomDateTimePicker } from "@/components/shared/common/custom-date-picker";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { CustomInputCell, MainImageCell, CoverGalleryCell } from "@/components/shared/import/custom-import-cells";

interface ImportProductRow extends BaseImportRow {
  name: string;
  price: string;
  categoryObj: CategoriesResponseModel | null;
  brandObj: BrandResponseModel | null;
  stockStatus: string;
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
    dispatch(fetchAllCategoriesService({ pageNo: 1, pageSize: 1000, search: "" }))
      .unwrap()
      .then((res: any) => {
        const list = res?.content || res?.data || (Array.isArray(res) ? res : []);
        setExistingCategories(list);
      })
      .catch((err) => console.error("Failed to pre-fetch categories for import", err));

    dispatch(fetchAllBrandService({ pageNo: 1, pageSize: 1000, search: "" }))
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
        const res: any = await dispatch(fetchAllCategoriesService({ pageNo: 1, pageSize: 1000, search: "" })).unwrap();
        catList = res?.content || res?.data || (Array.isArray(res) ? res : []);
        setExistingCategories(catList);
      } catch (e) {}
    }

    if (brandList.length === 0) {
      try {
        const res: any = await dispatch(fetchAllBrandService({ pageNo: 1, pageSize: 1000, search: "" })).unwrap();
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
      const stockStatus = get(["stock status", "stockstatus", "status"]);
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
        stockStatus: stockStatus || "ENABLED",
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
    const isValid = isNameValid && isPriceValid && isCategoryValid;

    let error: string | undefined;
    if (!isNameValid) error = "Product Name is required.";
    else if (!isPriceValid) error = "Price must be a valid number.";
    else if (!isCategoryValid) error = "Category is required.";

    return {
      isValid,
      error,
      fieldErrors: {
        __nameError: !isNameValid,
        __priceError: !isPriceValid,
        __categoryError: !isCategoryValid,
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

  const onImportBatch = async (rowsToProcess: ImportProductRow[], importId?: string) => {
    const payloads = [];
    for (const row of rowsToProcess) {
      const imagesPayload: any[] = [];
      let displayOrderCounter = 1;

      // 1. Upload Main Image (isPrimary: true)
      if (row.__mainImageFile) {
        try {
          const result = await uploadMultiSize(row.__mainImageFile, AppDefault.BUSINESS_ID);
          imagesPayload.push({
            imageUrl: { sm: result.sm.url, md: result.md.url, o: result.o.url },
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
        try {
          const result = await uploadMultiSize(coverFile, AppDefault.BUSINESS_ID);
          imagesPayload.push({
            imageUrl: { sm: result.sm.url, md: result.md.url, o: result.o.url },
            isPrimary: imagesPayload.length === 0, // Fallback to primary if main image was omitted
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
        stockStatus: row.stockStatus || "ENABLED",
        description: row.description || undefined,
        hasSizes: false,
        images: imagesPayload,
        promotionType: hasPromotion ? row.promotionType : undefined,
        promotionValue: hasPromotion && row.promotionValue ? Number(row.promotionValue) : undefined,
        promotionFromDate: hasPromotion && row.promotionFromDate ? row.promotionFromDate : undefined,
        promotionToDate: hasPromotion && row.promotionToDate ? row.promotionToDate : undefined,
      });
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
      key: "stockStatus",
      label: "Stock",
      type: "custom",
      fieldKey: "stockStatus",
      width: "130px",
      minWidth: "110px",
      renderCustom: (row, rowIdx, isDisabled, onChange) => (
        <CustomSelect
          size="md"
          options={PRODUCT_STOCK_STATUS_CREATE_UPDATE}
          value={row.stockStatus || "ENABLED"}
          placeholder="Stock"
          onValueChange={(val) => onChange(val)}
          disabled={isDisabled}
          className="h-8 text-xs"
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
          />
        );
      },
    },
  ];

  return (
    <GenericExcelImport<ImportProductRow>
      title="Import Products (No Sizes)"
      description="Upload an Excel spreadsheet to bulk create standard products with Categories, Brands, Main & Cover Gallery Images, Stock Status & Promotions"
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
