"use client";

import { Messages } from "@/constants/messages";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, X } from "lucide-react";
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
import { useAppDispatch, useAppSelector } from "@/store";
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
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { ComboboxSelectBrand } from "@/components/shared/combobox/combobox_select_brand";
import { ComboboxSelectCategories } from "@/components/shared/combobox/combobox_select_categories";
import { uploadMultiSize } from "@/services/spaces-service";
import { AppDefault } from "@/constants/app-resource/default/default";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
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

const MAX_PRODUCT_IMAGES = 5;

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

  const [pendingMainFile, setPendingMainFile] = useState<File | null>(null);
  const [mainPreviewUrl, setMainPreviewUrl] = useState<string>("");
  const [pendingImageFiles, setPendingImageFiles] = useState<(File | null)[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<BrandResponseModel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoriesResponseModel | null>(null);

  useEffect(() => {
    if (!mainPreviewUrl || !mainPreviewUrl.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(mainPreviewUrl);
  }, [mainPreviewUrl]);

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
      mainImage: { sm: "", md: "", o: "" },
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
  const promotionType = watch("promotionType");
  const hasSizes = sizeFields.length > 0;
  const showPromotionFields = promotionType && promotionType !== "NONE";

  const remainingSlots = MAX_PRODUCT_IMAGES - imageFields.length;
  const canAddMore = imageFields.length < MAX_PRODUCT_IMAGES;

  const handleRemoveImage = (index: number) => {
    const blobUrl = watch(`images.${index}.image.sm`);
    if (blobUrl?.startsWith("blob:")) URL.revokeObjectURL(blobUrl);
    const newFiles = [...pendingImageFiles];
    newFiles.splice(index, 1);
    setPendingImageFiles(newFiles);
    removeImage(index);
  };

  const handleMultipleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (imageFields.length >= MAX_PRODUCT_IMAGES) {
      showToast.error(`Maximum ${MAX_PRODUCT_IMAGES} images allowed`);
      event.target.value = "";
      return;
    }

    const availableSlots = MAX_PRODUCT_IMAGES - imageFields.length;
    const filesToProcess = Array.from(files).slice(0, availableSlots);

    if (files.length > availableSlots) {
      showToast.warning(
        `Only ${availableSlots} slot${availableSlots > 1 ? "s" : ""} remaining. Processing first ${availableSlots} image${availableSlots > 1 ? "s" : ""}.`,
      );
    }

    setIsProcessingImages(true);
    const newFiles = [...pendingImageFiles];

    try {
      const maxSize = 5 * 1024 * 1024;
      let added = 0;
      const errors: string[] = [];

      filesToProcess.forEach((file) => {
        if (!file.type.startsWith("image/")) {
          errors.push(`${file.name} is not an image`);
          return;
        }
        if (file.size > maxSize) {
          errors.push(`${file.name} exceeds 5MB`);
          return;
        }
        const blobUrl = URL.createObjectURL(file);
        appendImage({ image: { sm: blobUrl, md: blobUrl, o: blobUrl } });
        newFiles.push(file);
        added++;
      });

      setPendingImageFiles(newFiles);

      if (added > 0) {
        showToast.success(`Added ${added} image${added > 1 ? "s" : ""}`);
      }
      if (errors.length > 0) {
        showToast.error(`${errors.length} image(s) failed to process`);
      }
    } catch {
      showToast.error(Messages.product.imagesFailed);
    } finally {
      setIsProcessingImages(false);
      event.target.value = "";
    }
  };

  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(fetchProductByIdService(productId));

        if (fetchProductByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          if (data.brandId) {
            setSelectedBrand({ id: data.brandId, name: data.brandName } as BrandResponseModel);
          }

          if (data.categoryId) {
            setSelectedCategory({ id: data.categoryId, name: data.categoryName } as CategoriesResponseModel);
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
            mainImage: {
              sm: data.mainImage?.sm || "",
              md: data.mainImage?.md || "",
              o: data.mainImage?.o || "",
            },
            promotionType: data.promotionType || "NONE",
            promotionValue: data.promotionValue || undefined,
            promotionFromDate: data.promotionFromDate || "",
            promotionToDate: data.promotionToDate || "",
            images: (data.images || []).map((img: { id?: string; image?: { sm?: string; md?: string; o?: string } }) => ({
              id: img.id,
              image: { sm: img.image?.sm || "", md: img.image?.md || "", o: img.image?.o || "" },
            })),
            sizes: data.sizes || [],
            customizations: data.customizations || [],
            status: data.status || ProductStatus.ACTIVE,
          });
          setMainPreviewUrl(data.mainImage?.md || data.mainImage?.sm || "");
          setPendingMainFile(null);
          setPendingImageFiles((data.images || []).map(() => null));
        }
      } catch {
      }
    };

    fetchProductData();
  }, [productId, isOpen, isCreate, reset, dispatch]);

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
        mainImage: { sm: "", md: "", o: "" },
        promotionType: "NONE",
        promotionValue: undefined,
        promotionFromDate: "",
        promotionToDate: "",
        images: [],
        sizes: [],
        customizations: [],
        status: ProductStatus.ACTIVE,
      });
      setPendingMainFile(null);
      setMainPreviewUrl("");
      setPendingImageFiles([]);
    }
  }, [isOpen, isCreate, reset]);

  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

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

      let mainImagePayload = data.mainImage;
      if (pendingMainFile) {
        try {
          const result = await uploadMultiSize(pendingMainFile, AppDefault.BUSINESS_ID);
          mainImagePayload = { sm: result.sm.url, md: result.md.url, o: result.o.url };
        } catch (uploadErr: any) {
          showToast.error(uploadErr?.message || Messages.product.mainImageFailed);
          setIsUploadingImage(false);
          return;
        }
      }

      const processedImages = await Promise.all(
        (data.images || []).map(async (img: { id?: string; image?: { sm?: string; md?: string; o?: string } }, i) => {
          const pendingFile = pendingImageFiles[i];
          if (pendingFile) {
            try {
              const result = await uploadMultiSize(pendingFile, AppDefault.BUSINESS_ID);
              return { id: img.id, image: { sm: result.sm.url, md: result.md.url, o: result.o.url } };
            } catch {
              return null;
            }
          }
          return img.image ? { id: img.id, image: img.image } : null;
        }),
      );

      const validImages = processedImages.filter(
        (img): img is { id?: string; image: { sm?: string; md?: string; o?: string } } =>
          img !== null && !!img.image,
      );

      setIsUploadingImage(false);

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

      const cleanedCustomizations = (data.customizations || []).map((customization) => ({
        id: customization.id,
        name: customization.name,
        priceAdjustment: customization.priceAdjustment || 0,
      }));

      const basePayload = {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        brandId: data.brandId || undefined,
        sku: data.sku || undefined,
        barcode: data.barcode || undefined,
        mainImage: mainImagePayload,
        images: validImages.length > 0 ? validImages : undefined,
        sizes: cleanedSizes.length > 0 ? cleanedSizes : undefined,
        customizations: cleanedCustomizations.length > 0 ? cleanedCustomizations : undefined,
        status: data.status,
      };

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
        showToast.success(Messages.product.created);
        handleClose();
      } else {
        await dispatch(
          updateProductService({
            productId: data.id!,
            productData: payload as any,
          }),
        ).unwrap();
        showToast.success(Messages.product.updated);
        handleClose();
      }
    } catch (error: unknown) {
      showToast.error(
        (error as { message?: string })?.message || `Failed to ${isCreate ? "create" : "update"} product`,
      );
    }
  };

  const handleClose = () => {
    reset();
    setPendingMainFile(null);
    setMainPreviewUrl("");
    setPendingImageFiles([]);
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
      <DialogContent className="w-full sm:max-w-7xl max-h-[92vh] p-0 gap-0 flex flex-col overflow-hidden">
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
          <div className="p-4 flex items-center justify-center min-h-[400px] flex-1">
            <Loading />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <FormBody>
              <div className="space-y-2">
                {reduxError && (
                  <div className="p-3 bg-destructive/10 border border-destructive rounded">
                    <p className="text-xs text-destructive font-medium">
                      {reduxError}
                    </p>
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-3 items-start">
                      {/* Left: main image */}
                      <div className="w-full md:w-44 flex-shrink-0">
                        <SpacesImageUpload
                          multiSize
                          deferred
                          label="Main Image"
                          businessId={AppDefault.BUSINESS_ID}
                          value={mainPreviewUrl}
                          onFileSelected={(file) => {
                            setPendingMainFile(file);
                            if (file) {
                              const blobUrl = URL.createObjectURL(file);
                              setMainPreviewUrl(blobUrl);
                              setValue(
                                "mainImage",
                                { sm: blobUrl, md: blobUrl, o: blobUrl },
                                { shouldDirty: true, shouldValidate: true },
                              );
                            } else {
                              setMainPreviewUrl("");
                              setValue(
                                "mainImage",
                                { sm: "", md: "", o: "" },
                                { shouldDirty: true, shouldValidate: true },
                              );
                            }
                          }}
                          aspectRatio="square"
                          maxSizeMb={5}
                          disabled={isProcessing}
                          placeholder="Click to upload"
                          helperText="PNG, JPG up to 5MB"
                        />
                      </div>

                      {/* Right: fields in 2-col grid */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                        <div className="col-span-1 sm:col-span-2">
                          <TextareaField
                            control={control}
                            name="description"
                            label="Description"
                            placeholder="Enter product description"
                            rows={2}
                            required
                            disabled={isProcessing}
                            error={errors.description}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
                              setValue("promotionType", "NONE", { shouldDirty: true });
                              setValue("promotionValue", undefined, { shouldDirty: true });
                              setValue("promotionFromDate", "", { shouldDirty: true });
                              setValue("promotionToDate", "", { shouldDirty: true });
                            }}
                            disabled={isProcessing}
                          >
                            Reset Promotion
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 auto-rows-max">
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
                                mode="date"
                                placeholder="Select start date"
                                disabled={isProcessing}
                                error={errors.promotionFromDate}
                              />
                            </div>

                            <div>
                              <DateTimePickerField
                                control={control}
                                name="promotionToDate"
                                label="Promotion To"
                                mode="date"
                                placeholder="Select end date"
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
                              document.getElementById("multiple-image-upload")?.click()
                            }
                            disabled={isProcessing}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {isProcessingImages ? "Processing..." : "Upload"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {imageFields.length === 0 ? (
                      <div className="text-center py-5 border-2 border-dashed rounded">
                        <p className="text-xs text-muted-foreground">
                          No images uploaded yet
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {imageFields.map((field, index) => (
                          <div key={field.id} className="relative aspect-square group">
                            <div className="w-full h-full rounded overflow-hidden border border-border/50 bg-muted">
                              {watch(`images.${index}.image.sm`) ? (
                                <img
                                  src={watch(`images.${index}.image.sm`)}
                                  alt={`Image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                  No image
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              disabled={isProcessing}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Product Sizes</CardTitle>
                      <div className="flex items-center gap-1">
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
                                setValue(`sizes.${idx}.promotionType`, "NONE", { shouldDirty: true });
                                setValue(`sizes.${idx}.promotionValue`, undefined, { shouldDirty: true });
                                setValue(`sizes.${idx}.promotionFromDate`, "", { shouldDirty: true });
                                setValue(`sizes.${idx}.promotionToDate`, "", { shouldDirty: true });
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
                          <Plus className="h-3 w-3 mr-1" />
                          Add Size
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {sizeFields.length === 0 ? (
                      <div className="text-center py-5">
                        <p className="text-xs text-muted-foreground">
                          {hasSizes
                            ? "No sizes defined."
                            : "No sizes defined. Product will use main pricing."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sizeFields.map((field, index) => {
                          const sizePromotionType = watch(`sizes.${index}.promotionType`);
                          const showSizePromotionFields =
                            sizePromotionType && sizePromotionType !== "NONE";

                          return (
                            <div
                              key={field.id}
                              className="border rounded p-3 space-y-3"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="font-semibold text-foreground">
                                  Size {index + 1}
                                </h4>
                                <div className="flex items-center gap-1">
                                  {showSizePromotionFields && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setValue(`sizes.${index}.promotionType`, "NONE", { shouldDirty: true });
                                        setValue(`sizes.${index}.promotionValue`, undefined, { shouldDirty: true });
                                        setValue(`sizes.${index}.promotionFromDate`, "", { shouldDirty: true });
                                        setValue(`sizes.${index}.promotionToDate`, "", { shouldDirty: true });
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
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Remove
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 auto-rows-max">
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
                                    error={errors.sizes?.[index]?.promotionType as any}
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
                                        error={errors.sizes?.[index]?.promotionValue as any}
                                        valueAsNumber={true}
                                        min={0}
                                        step="0.01"
                                        allowZero={false}
                                      />
                                    </div>

                                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 auto-rows-max">
                                      <div>
                                        <DateTimePickerField
                                          control={control}
                                          name={`sizes.${index}.promotionFromDate`}
                                          label="Promotion From"
                                          mode="date"
                                          placeholder="Select start date"
                                          disabled={isProcessing}
                                          error={errors.sizes?.[index]?.promotionFromDate as any}
                                        />
                                      </div>

                                      <div>
                                        <DateTimePickerField
                                          control={control}
                                          name={`sizes.${index}.promotionToDate`}
                                          label="Promotion To"
                                          mode="date"
                                          placeholder="Select end date"
                                          disabled={isProcessing}
                                          error={errors.sizes?.[index]?.promotionToDate as any}
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
                          })
                        }
                        disabled={isProcessing}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Customization
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {customizationFields.length === 0 ? (
                      <div className="text-center py-5">
                        <p className="text-xs text-muted-foreground">
                          No customizations defined
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {customizationFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="border rounded p-3 space-y-3"
                          >
                            <div className="flex items-center justify-between gap-1">
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
                                <Trash2 className="h-3 w-3 mr-1" />
                                Remove
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 auto-rows-max">
                              <div>
                                <TextField
                                  control={control}
                                  name={`customizations.${index}.name`}
                                  label="Customization Name"
                                  placeholder="e.g., Extra cheese, Add sauce"
                                  required
                                  disabled={isProcessing}
                                  error={errors.customizations?.[index]?.name as any}
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
                                  error={errors.customizations?.[index]?.priceAdjustment as any}
                                  valueAsNumber={true}
                                  min={0}
                                  step="0.01"
                                  allowZero={true}
                                />
                              </div>
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
