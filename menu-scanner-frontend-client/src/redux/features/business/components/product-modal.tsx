"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchProductByIdService,
  createProductService,
  updateProductService,
} from "../store/thunks/product-thunks";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { showToast } from "@/components/shared/common/show-toast";
import { clearError, clearSelectedProduct } from "../store/slice/product-slice";
import {
  selectError,
  selectOperations,
  selectSelectedProduct,
  selectIsFetchingDetail,
} from "../store/selectors/product-selector";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { ModalMode, ProductStatus } from "@/constants/status/status";
import {
  PRODUCT_STATUS_CREATE_UPDATE,
  PROMOTION_TYPE_CREATE_UPDATE,
} from "@/constants/status/create-update-status";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { ComboboxSelectBrand } from "@/components/shared/combobox/combobox_select_brand";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { uploadImage, isBase64Image } from "@/utils/common/upload-image";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import {
  createProductSchema,
  ProductFormData,
  updateProductSchema,
} from "../store/models/schema/product-schema";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { Loading } from "@/components/shared/common/loading";

type Props = {
  mode: ModalMode;
  productId?: string;
  onClose: () => void;
  isOpen: boolean;
};

const MAX_PRODUCT_IMAGES = 5; // Maximum number of product images allowed

export default function ProductModal({
  isOpen,
  onClose,
  productId,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const productData = useAppSelector(selectSelectedProduct);
  const { isCreating, isUpdating } = operations;

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<BrandResponseModel | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] =
    useState<CategoriesResponseModel | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(
      isCreate ? createProductSchema : updateProductSchema,
    ) as any,
    defaultValues: {
      id: "",
      name: "",
      description: "",
      categoryId: "",
      brandId: "",
      sku: "",
      barcode: "",
      price: 0,
      mainImageUrl: "",
      promotionType: "NONE",
      promotionValue: undefined,
      promotionFromDate: "",
      promotionToDate: "",
      images: [],
      sizes: [],
      customizations: [],
      status: ProductStatus.ACTIVE,
    },
    mode: "onChange",
  });

  // Field arrays for images, sizes, and customizations
  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: "images",
  });

  const {
    fields: sizeFields,
    append: appendSize,
    remove: removeSize,
  } = useFieldArray({
    control,
    name: "sizes",
  });

  const {
    fields: customizationFields,
    append: appendCustomization,
    remove: removeCustomization,
  } = useFieldArray({
    control,
    name: "customizations",
  });

  const productName = watch("name");
  const mainImageUrl = watch("mainImageUrl");
  const promotionType = watch("promotionType");
  const hasSizes = sizeFields.length > 0;
  const showPromotionFields = promotionType && promotionType !== "NONE";

  // Calculate remaining slots
  const remainingSlots = MAX_PRODUCT_IMAGES - imageFields.length;
  const canAddMore = imageFields.length < MAX_PRODUCT_IMAGES;

  // Handle multiple image uploads with max limit
  const handleMultipleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (imageFields.length >= MAX_PRODUCT_IMAGES) {
      showToast.error(`Maximum ${MAX_PRODUCT_IMAGES} images allowed`);
      event.target.value = "";
      return;
    }

    // Calculate how many files we can actually accept
    const availableSlots = MAX_PRODUCT_IMAGES - imageFields.length;
    const filesToProcess = Array.from(files).slice(0, availableSlots);

    if (files.length > availableSlots) {
      showToast.warning(
        `Only ${availableSlots} slot${
          availableSlots > 1 ? "s" : ""
        } remaining. Processing first ${availableSlots} image${
          availableSlots > 1 ? "s" : ""
        }.`,
      );
    }

    setIsProcessingImages(true);

    try {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      const results = await Promise.all(
        filesToProcess.map(async (file) => {
          if (!file.type.startsWith("image/")) {
            return { success: false, error: `${file.name} is not an image` };
          }
          if (file.size > maxSize) {
            return { success: false, error: `${file.name} exceeds 5MB` };
          }
          try {
            const base64 = await fileToBase64(file);
            return { success: true, base64 };
          } catch {
            return { success: false, error: `Failed to process ${file.name}` };
          }
        }),
      );

      const successfulImages = results.filter(
        (r): r is { success: true; base64: string } => r.success,
      );
      const failedImages = results.filter(
        (r): r is { success: false; error: string } => !r.success,
      );

      if (successfulImages.length > 0) {
        successfulImages.forEach((img) => {
          appendImage({ imageUrl: img.base64 });
        });
        showToast.success(
          `Added ${successfulImages.length} image${
            successfulImages.length > 1 ? "s" : ""
          }`,
        );
      }

      if (failedImages.length > 0) {
        showToast.error(`${failedImages.length} image(s) failed to upload`);
      }
    } catch (error) {
      showToast.error("Failed to process images");
    } finally {
      setIsProcessingImages(false);
      event.target.value = "";
    }
  };

  // Fetch product data for edit mode
  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(fetchProductByIdService(productId));

        if (fetchProductByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          // Set combobox selections
          if (data.brandId) {
            setSelectedBrand({
              id: data.brandId,
              name: data.brandName,
            } as BrandResponseModel);
          }

          if (data.categoryId) {
            setSelectedCategory({
              id: data.categoryId,
              name: data.categoryName,
            } as CategoriesResponseModel);
          }

          reset({
            id: data.id,
            name: data.name || "",
            description: data.description || "",
            categoryId: data.categoryId || "",
            brandId: data.brandId || "",
            sku: data.sku || "",
            barcode: data.barcode || "",
            price: data.price || 0,
            mainImageUrl: data.mainImageUrl || "",
            promotionType: data.promotionType || "NONE",
            promotionValue: data.promotionValue || undefined,
            promotionFromDate: data.promotionFromDate || "",
            promotionToDate: data.promotionToDate || "",
            images: data.images || [],
            sizes: data.sizes || [],
            customizations: data.customizations || [],
            status: data.status || ProductStatus.ACTIVE,
          });
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProductData();
  }, [productId, isOpen, isCreate, reset, dispatch]);

  // Reset form for create mode
  useEffect(() => {
    if (isOpen && isCreate) {
      setSelectedBrand(null);
      setSelectedCategory(null);
      reset({
        name: "",
        description: "",
        categoryId: "",
        brandId: "",
        sku: "",
        barcode: "",
        price: 0,
        mainImageUrl: "",
        promotionType: "NONE",
        promotionValue: undefined,
        promotionFromDate: "",
        promotionToDate: "",
        images: [],
        sizes: [],
        customizations: [],
        status: ProductStatus.ACTIVE,
      });
    }
  }, [isOpen, isCreate, reset]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  // Helper function to clean promotion data
  const cleanPromotionData = (
    promotionType?: string,
    promotionValue?: number,
    promotionFromDate?: string,
    promotionToDate?: string,
  ) => {
    if (!promotionType || promotionType === "NONE") {
      return {
        promotionType: null,
        promotionValue: null,
        promotionFromDate: null,
        promotionToDate: null,
      };
    }

    return {
      promotionType: promotionType || undefined,
      promotionValue: promotionValue || undefined,
      promotionFromDate: promotionFromDate || undefined,
      promotionToDate: promotionToDate || undefined,
    };
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsUploadingImage(true);

      // Upload main image if it's base64
      let finalMainImageUrl = data.mainImageUrl;
      if (finalMainImageUrl && isBase64Image(finalMainImageUrl)) {
        try {
          finalMainImageUrl = await uploadImage(finalMainImageUrl);
        } catch (uploadError) {
          showToast.error("Failed to upload main image");
          setIsUploadingImage(false);
          return;
        }
      }

      // Upload product images
      const processedImages = await Promise.all(
        (data.images || []).map(async (img: any) => {
          if (!img.imageUrl) return null;

          let imageUrl = img.imageUrl;
          if (isBase64Image(imageUrl)) {
            try {
              imageUrl = await uploadImage(imageUrl);
            } catch (error) {
              console.error("Failed to upload product image:", error);
              return null;
            }
          }

          return {
            id: img.id,
            imageUrl,
          };
        }),
      );

      const validImages = processedImages.filter(
        (img: any): img is { id?: string; imageUrl: string } =>
          img !== null && !!img.imageUrl,
      );

      setIsUploadingImage(false);

      // Clean sizes data
      const cleanedSizes = (data.sizes || []).map((size) => ({
        id: size.id,
        name: size.name,
        price: size.price,
        ...cleanPromotionData(
          size.promotionType,
          size.promotionValue,
          size.promotionFromDate,
          size.promotionToDate,
        ),
      }));

      // Clean customizations data
      const cleanedCustomizations = (data.customizations || []).map((customization) => ({
        id: customization.id,
        name: customization.name,
        priceAdjustment: customization.priceAdjustment || 0,
        status: customization.status || "ACTIVE",
      }));

      // Prepare base payload
      const basePayload = {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        brandId: data.brandId || undefined,
        sku: data.sku || undefined,
        barcode: data.barcode || undefined,
        mainImageUrl: finalMainImageUrl,
        images: validImages.length > 0 ? validImages : undefined,
        sizes: cleanedSizes.length > 0 ? cleanedSizes : undefined,
        customizations: cleanedCustomizations.length > 0 ? cleanedCustomizations : undefined,
        status: data.status,
      };

      // If product has sizes, pricing comes from sizes
      const payload = hasSizes
        ? {
            ...basePayload,
            price: null,
            promotionType: null,
            promotionValue: null,
            promotionFromDate: null,
            promotionToDate: null,
          }
        : {
            ...basePayload,
            price: data.price,
            ...cleanPromotionData(
              data.promotionType,
              data.promotionValue,
              data.promotionFromDate,
              data.promotionToDate,
            ),
          };

      if (isCreate) {
        await dispatch(createProductService(payload as any)).unwrap();
        showToast.success("Product created successfully");
        handleClose();
      } else {
        await dispatch(
          updateProductService({
            productId: data.id!,
            productData: payload as any,
          }),
        ).unwrap();
        showToast.success("Product updated successfully");
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error?.message || `Failed to ${isCreate ? "create" : "update"} product`,
      );
    }
  };

  const handleClose = () => {
    reset();
    setIsUploadingImage(false);
    setIsProcessingImages(false);
    setSelectedBrand(null);
    setSelectedCategory(null);
    dispatch(clearError());
    dispatch(clearSelectedProduct());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;
  const isProcessing = isSubmitting || isUploadingImage || isProcessingImages;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        <DialogTitle className="sr-only">
          {isCreate ? "Create New Product" : `Edit Product - ${productName}`}
        </DialogTitle>

        <FormHeader
          title={isCreate ? "Create New Product" : "Edit Product"}
          description={
            isCreate
              ? "Fill out the form to create a new product"
              : "Update product information below"
          }
          avatarName={productName || "Product"}
          isCreate={isCreate}
        />

        {!isCreate && isFetchingDetail ? (
          <div className="p-6 flex items-center justify-center min-h-[400px] flex-1">
            <Loading />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <FormBody>
              <div className="space-y-6">
                {reduxError && (
                  <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                    <p className="text-sm text-destructive font-medium">
                      {reduxError}
                    </p>
                  </div>
                )}

                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
                      <div>
                        <TextField
                          control={control}
                          name="name"
                          label="Product Name"
                          placeholder="Enter product name"
                          required
                          disabled={isProcessing}
                          error={errors.name}
                        />
                      </div>

                      <div>
                        <ComboboxSelectCategories
                          dataSelect={selectedCategory}
                          onChangeSelected={(category) => {
                            setSelectedCategory(category);
                            setValue("categoryId", category?.id || "", {
                              shouldDirty: true,
                            });
                          }}
                          label="Category"
                          placeholder="Select category"
                          required
                          disabled={isProcessing}
                          error={errors.categoryId?.message}
                          showAllOption={false}
                        />
                      </div>

                      <div>
                        <ComboboxSelectBrand
                          dataSelect={selectedBrand}
                          onChangeSelected={(brand) => {
                            setSelectedBrand(brand);
                            setValue("brandId", brand?.id || "", {
                              shouldDirty: true,
                            });
                          }}
                          label="Brand (Optional)"
                          placeholder="Select brand"
                          disabled={isProcessing}
                          error={errors.brandId?.message}
                          showAllOption={false}
                        />
                      </div>

                      <div>
                        <TextField
                          control={control}
                          name="sku"
                          label="SKU"
                          placeholder="Enter SKU"
                          disabled={isProcessing}
                          error={errors.sku}
                        />
                      </div>

                      <div>
                        <TextField
                          control={control}
                          name="barcode"
                          label="Barcode"
                          placeholder="Enter barcode"
                          disabled={isProcessing}
                          error={errors.barcode}
                        />
                      </div>

                      <div>
                        <SelectField
                          control={control}
                          name="status"
                          label="Status"
                          placeholder="Select status"
                          options={PRODUCT_STATUS_CREATE_UPDATE}
                          required
                          disabled={isProcessing}
                          error={errors.status}
                        />
                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <TextareaField
                          control={control}
                          name="description"
                          label="Description"
                          placeholder="Enter product description"
                          rows={1}
                          required
                          disabled={isProcessing}
                          error={errors.description}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Main Product Image */}
                <Card>
                  <CardHeader>
                    <CardTitle>Product Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ClickableImageUpload
                      label="Main Product Image"
                      value={mainImageUrl}
                      onChange={(base64) =>
                        setValue("mainImageUrl", base64, { shouldDirty: true })
                      }
                      aspectRatio="square"
                      height="h-48"
                      maxSize={5}
                      required
                      error={errors.mainImageUrl}
                      placeholder="Click to upload main product image"
                      helperText="PNG, JPG up to 5MB"
                    />
                  </CardContent>
                </Card>

                {/* Pricing Section - Only show if no sizes */}
                {!hasSizes && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Pricing Information</CardTitle>
                        {showPromotionFields && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setValue("promotionType", "NONE", {
                                shouldDirty: true,
                              });
                              setValue("promotionValue", undefined, {
                                shouldDirty: true,
                              });
                              setValue("promotionFromDate", "", {
                                shouldDirty: true,
                              });
                              setValue("promotionToDate", "", {
                                shouldDirty: true,
                              });
                            }}
                            disabled={isProcessing}
                          >
                            Reset Promotion
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
                        <div>
                          <TextField
                            control={control}
                            name="price"
                            label="Base Price"
                            type="number"
                            placeholder="Enter price"
                            required
                            disabled={isProcessing}
                            error={errors.price}
                            valueAsNumber={true}
                            min={0}
                            step="0.01"
                            allowZero={true}
                          />
                        </div>

                        <div>
                          <SelectField
                            control={control}
                            name="promotionType"
                            label="Promotion Type"
                            placeholder="Select promotion type"
                            options={PROMOTION_TYPE_CREATE_UPDATE}
                            disabled={isProcessing}
                            error={errors.promotionType}
                          />
                        </div>

                        {/* Only show promotion fields when type is not NONE */}
                        {showPromotionFields && (
                          <>
                            <div>
                              <TextField
                                control={control}
                                name="promotionValue"
                                label="Promotion Value"
                                type="number"
                                placeholder="Enter promotion value"
                                disabled={isProcessing}
                                error={errors.promotionValue as any}
                                valueAsNumber={true}
                                min={0}
                                step="0.01"
                                allowZero={false}
                              />
                            </div>

                            <div>
                              <DateTimePickerField
                                control={control}
                                name="promotionFromDate"
                                label="Promotion From"
                                mode="datetime"
                                placeholder="Select start date & time"
                                disabled={isProcessing}
                                error={errors.promotionFromDate}
                              />
                            </div>

                            <div>
                              <DateTimePickerField
                                control={control}
                                name="promotionToDate"
                                label="Promotion To"
                                mode="datetime"
                                placeholder="Select end date & time"
                                disabled={isProcessing}
                                error={errors.promotionToDate}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Product Sizes */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Product Sizes</CardTitle>
                      <div className="flex items-center gap-2">
                        {hasSizes && sizeFields.some((_, idx) => {
                          const sizePromotionType = watch(`sizes.${idx}.promotionType`);
                          return sizePromotionType && sizePromotionType !== "NONE";
                        }) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              sizeFields.forEach((_, idx) => {
                                setValue(`sizes.${idx}.promotionType`, "NONE", {
                                  shouldDirty: true,
                                });
                                setValue(`sizes.${idx}.promotionValue`, undefined, {
                                  shouldDirty: true,
                                });
                                setValue(`sizes.${idx}.promotionFromDate`, "", {
                                  shouldDirty: true,
                                });
                                setValue(`sizes.${idx}.promotionToDate`, "", {
                                  shouldDirty: true,
                                });
                              });
                            }}
                            disabled={isProcessing}
                          >
                            Reset All Promotions
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            appendSize({
                              name: "",
                              barcode: "",
                              sku: "",
                              price: 0,
                              promotionType: "NONE",
                              promotionValue: undefined,
                              promotionFromDate: "",
                              promotionToDate: "",
                            })
                          }
                          disabled={isProcessing}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Size
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {sizeFields.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">
                          {hasSizes
                            ? "No sizes defined."
                            : "No sizes defined. Product will use main pricing."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sizeFields.map((field, index) => {
                          const sizePromotionType = watch(
                            `sizes.${index}.promotionType`,
                          );
                          const showSizePromotionFields =
                            sizePromotionType &&
                            sizePromotionType !== "NONE";

                          return (
                            <div
                              key={field.id}
                              className="border rounded-lg p-4 space-y-4"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-semibold text-foreground">
                                  Size {index + 1}
                                </h4>
                                <div className="flex items-center gap-2">
                                  {showSizePromotionFields && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setValue(
                                          `sizes.${index}.promotionType`,
                                          "NONE",
                                          { shouldDirty: true }
                                        );
                                        setValue(
                                          `sizes.${index}.promotionValue`,
                                          undefined,
                                          { shouldDirty: true }
                                        );
                                        setValue(
                                          `sizes.${index}.promotionFromDate`,
                                          "",
                                          { shouldDirty: true }
                                        );
                                        setValue(
                                          `sizes.${index}.promotionToDate`,
                                          "",
                                          { shouldDirty: true }
                                        );
                                      }}
                                      disabled={isProcessing}
                                    >
                                      Reset
                                    </Button>
                                  )}
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeSize(index)}
                                    disabled={isProcessing}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
                                <div>
                                  <TextField
                                    control={control}
                                    name={`sizes.${index}.name`}
                                    label="Size Name"
                                    placeholder="e.g., Small, Medium, Large"
                                    disabled={isProcessing}
                                    error={errors.sizes?.[index]?.name as any}
                                  />
                                </div>

                                <div>
                                  <TextField
                                    control={control}
                                    name={`sizes.${index}.price`}
                                    label="Price"
                                    type="number"
                                    placeholder="Enter price"
                                    disabled={isProcessing}
                                    error={errors.sizes?.[index]?.price as any}
                                    valueAsNumber={true}
                                    min={0}
                                    step="0.01"
                                    allowZero={true}
                                  />
                                </div>

                                <div>
                                  <TextField
                                    control={control}
                                    name={`sizes.${index}.sku`}
                                    label="SKU"
                                    placeholder="Enter SKU"
                                    disabled={isProcessing}
                                    error={errors.sizes?.[index]?.sku as any}
                                  />
                                </div>

                                <div>
                                  <TextField
                                    control={control}
                                    name={`sizes.${index}.barcode`}
                                    label="Barcode"
                                    placeholder="Enter barcode"
                                    disabled={isProcessing}
                                    error={errors.sizes?.[index]?.barcode as any}
                                  />
                                </div>

                                <div>
                                  <SelectField
                                    control={control}
                                    name={`sizes.${index}.promotionType`}
                                    label="Promotion Type"
                                    placeholder="Select promotion type"
                                    options={PROMOTION_TYPE_CREATE_UPDATE}
                                    disabled={isProcessing}
                                    error={
                                      errors.sizes?.[index]?.promotionType as any
                                    }
                                  />
                                </div>

                                {showSizePromotionFields && (
                                  <>
                                    <div>
                                      <TextField
                                        control={control}
                                        name={`sizes.${index}.promotionValue`}
                                        label="Promotion Value"
                                        type="number"
                                        placeholder="Enter promotion value"
                                        disabled={isProcessing}
                                        error={
                                          errors.sizes?.[index]
                                            ?.promotionValue as any
                                        }
                                        valueAsNumber={true}
                                        min={0}
                                        step="0.01"
                                        allowZero={false}
                                      />
                                    </div>

                                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
                                      <div>
                                        <DateTimePickerField
                                          control={control}
                                          name={`sizes.${index}.promotionFromDate`}
                                          label="Promotion From"
                                          mode="datetime"
                                          placeholder="Select start date & time"
                                          disabled={isProcessing}
                                          error={
                                            errors.sizes?.[index]
                                              ?.promotionFromDate as any
                                          }
                                        />
                                      </div>

                                      <div>
                                        <DateTimePickerField
                                          control={control}
                                          name={`sizes.${index}.promotionToDate`}
                                          label="Promotion To"
                                          mode="datetime"
                                          placeholder="Select end date & time"
                                          disabled={isProcessing}
                                          error={
                                            errors.sizes?.[index]
                                              ?.promotionToDate as any
                                          }
                                        />
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Product Customizations */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Product Customizations</CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendCustomization({
                            name: "",
                            priceAdjustment: 0,
                            status: "ACTIVE",
                          })
                        }
                        disabled={isProcessing}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Customization
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {customizationFields.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">
                          No customizations defined
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {customizationFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="border rounded-lg p-4 space-y-4"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-semibold text-foreground">
                                Customization {index + 1}
                              </h4>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeCustomization(index)}
                                disabled={isProcessing}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
                              <div>
                                <TextField
                                  control={control}
                                  name={`customizations.${index}.name`}
                                  label="Customization Name"
                                  placeholder="e.g., Extra cheese, Add sauce"
                                  required
                                  disabled={isProcessing}
                                  error={
                                    errors.customizations?.[index]?.name as any
                                  }
                                />
                              </div>

                              <div>
                                <TextField
                                  control={control}
                                  name={`customizations.${index}.priceAdjustment`}
                                  label="Price Adjustment"
                                  type="number"
                                  placeholder="Enter price adjustment"
                                  disabled={isProcessing}
                                  error={
                                    errors.customizations?.[index]
                                      ?.priceAdjustment as any
                                  }
                                  valueAsNumber={true}
                                  min={0}
                                  step="0.01"
                                  allowZero={true}
                                />
                              </div>

                              <div>
                                <SelectField
                                  control={control}
                                  name={`customizations.${index}.status`}
                                  label="Status"
                                  placeholder="Select status"
                                  options={[
                                    { value: "ACTIVE", label: "Active" },
                                    { value: "INACTIVE", label: "Inactive" },
                                  ]}
                                  disabled={isProcessing}
                                  error={
                                    errors.customizations?.[index]?.status as any
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Product Images */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Product Images</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {imageFields.length > 0
                            ? `${imageFields.length}/${MAX_PRODUCT_IMAGES} images uploaded`
                            : `Upload up to ${MAX_PRODUCT_IMAGES} product images`}
                        </p>
                      </div>
                      {canAddMore && (
                        <div>
                          <input
                            type="file"
                            id="multiple-image-upload"
                            multiple
                            accept="image/*"
                            onChange={handleMultipleImageUpload}
                            className="hidden"
                            disabled={isProcessing}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              document
                                .getElementById("multiple-image-upload")
                                ?.click()
                            }
                            disabled={isProcessing}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {isProcessingImages ? "Processing..." : "Upload"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {imageFields.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          No images uploaded yet
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2">
                        {imageFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="relative aspect-square rounded-md overflow-hidden border bg-muted"
                          >
                            <div className="w-full h-full">
                              <ClickableImageUpload
                                label=""
                                value={
                                  watch(`images.${index}.imageUrl`) || ""
                                }
                                onChange={(base64) => {
                                  if (base64 === "") {
                                    // Image removed - delete from array
                                    removeImage(index);
                                  } else {
                                    // Image uploaded/changed
                                    setValue(
                                      `images.${index}.imageUrl`,
                                      base64,
                                      {
                                        shouldDirty: true,
                                      },
                                    );
                                  }
                                }}
                                aspectRatio="square"
                                height="h-full"
                                maxSize={5}
                                disabled={isProcessing}
                                error={
                                  errors.images?.[index]?.imageUrl as any
                                }
                                showPreviewText={false}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </FormBody>

            <FormFooter
              isSubmitting={isProcessing}
              isDirty={isDirty}
              isCreate={isCreate}
              createMessage={
                isUploadingImage ? "Uploading images..." : "Creating product..."
              }
              updateMessage={
                isUploadingImage ? "Uploading images..." : "Updating product..."
              }
            >
              <CancelButton onClick={handleClose} disabled={isProcessing} />
              <SubmitButton
                isSubmitting={isProcessing}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create Product"
                updateText="Update Product"
                submittingCreateText={
                  isUploadingImage ? "Uploading..." : "Creating..."
                }
                submittingUpdateText={
                  isUploadingImage ? "Uploading..." : "Updating..."
                }
              />
            </FormFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
