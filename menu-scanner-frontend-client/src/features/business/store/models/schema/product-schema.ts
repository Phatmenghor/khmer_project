
import { z } from "zod";


export const imageSchema = z.object({
  id: z.string().optional(),
  imageUrl: z
    .string()
    .url("Invalid image URL")
    .or(z.string().min(1, "Image URL required")),
});


export const customizationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Customization name is required"),
  priceAdjustment: z
    .number()
    .min(0, "Price adjustment must be zero or positive")
    .optional(),
});


export const sizeSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, "Size name is required"),
    barcode: z.string().optional(),
    sku: z.string().optional(),
    price: z.number().min(0, "Price must be positive"),
    promotionType: z.string().optional(),
    promotionValue: z
      .number()
      .min(0, "Promotion value must be positive")
      .optional(),
    promotionFromDate: z.string().optional(),
    promotionToDate: z.string().optional(),
  })
  .refine(
    (data) => {

      if (data.promotionType && data.promotionType !== "NONE") {
        return (
          data.promotionValue !== undefined &&
          data.promotionValue > 0 &&
          data.promotionFromDate &&
          data.promotionFromDate !== "" &&
          data.promotionToDate &&
          data.promotionToDate !== ""
        );
      }
      return true;
    },
    {
      message:
        "Promotion value and dates are required when promotion type is selected",
      path: ["promotionValue"],
    }
  )
  .refine(
    (data) => {

      if (
        data.promotionType &&
        data.promotionType !== "NONE" &&
        data.promotionFromDate &&
        data.promotionToDate
      ) {
        return (
          new Date(data.promotionToDate) > new Date(data.promotionFromDate)
        );
      }
      return true;
    },
    {
      message: "Promotion end date must be after start date",
      path: ["promotionToDate"],
    }
  );


const baseProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  mainImageUrl: z
    .string()
    .url("Invalid main image URL")
    .or(z.string().min(1, "Main image required")),


  price: z.number().min(0, "Price must be positive").optional(),
  promotionType: z.string().optional(),
  promotionValue: z
    .number()
    .min(0, "Promotion value must be positive")
    .optional(),
  promotionFromDate: z.string().optional(),
  promotionToDate: z.string().optional(),

  images: z.array(imageSchema).optional().default([]),
  sizes: z.array(sizeSchema).optional().default([]),
  customizations: z.array(customizationSchema).optional().default([]),
  status: z.string().min(1, "Status is required"),
});


export const createProductSchema = baseProductSchema
  .refine(
    (data) => {

      if (!data.sizes || data.sizes.length === 0) {
        return data.price !== undefined && data.price >= 0;
      }
      return true;
    },
    {
      message: "Price is required when product has no sizes",
      path: ["price"],
    }
  )
  .refine(
    (data) => {

      if (
        (!data.sizes || data.sizes.length === 0) &&
        data.promotionType &&
        data.promotionType !== "NONE"
      ) {
        return (
          data.promotionValue !== undefined &&
          data.promotionValue > 0 &&
          data.promotionFromDate &&
          data.promotionFromDate !== "" &&
          data.promotionToDate &&
          data.promotionToDate !== ""
        );
      }
      return true;
    },
    {
      message:
        "Promotion value and dates are required when promotion type is selected",
      path: ["promotionValue"],
    }
  )
  .refine(
    (data) => {

      if (
        (!data.sizes || data.sizes.length === 0) &&
        data.promotionType &&
        data.promotionType !== "NONE" &&
        data.promotionFromDate &&
        data.promotionToDate
      ) {
        return (
          new Date(data.promotionToDate) > new Date(data.promotionFromDate)
        );
      }
      return true;
    },
    {
      message: "Promotion end date must be after start date",
      path: ["promotionToDate"],
    }
  );


export const updateProductSchema = baseProductSchema
  .extend({
    id: z.string().min(1, "Product ID is required"),
  })
  .refine(
    (data) => {

      if (!data.sizes || data.sizes.length === 0) {
        return data.price !== undefined && data.price >= 0;
      }
      return true;
    },
    {
      message: "Price is required when product has no sizes",
      path: ["price"],
    }
  )
  .refine(
    (data) => {

      if (
        (!data.sizes || data.sizes.length === 0) &&
        data.promotionType &&
        data.promotionType !== "NONE"
      ) {
        return (
          data.promotionValue !== undefined &&
          data.promotionValue > 0 &&
          data.promotionFromDate &&
          data.promotionFromDate !== "" &&
          data.promotionToDate &&
          data.promotionToDate !== ""
        );
      }
      return true;
    },
    {
      message:
        "Promotion value and dates are required when promotion type is selected",
      path: ["promotionValue"],
    }
  )
  .refine(
    (data) => {

      if (
        (!data.sizes || data.sizes.length === 0) &&
        data.promotionType &&
        data.promotionType !== "NONE" &&
        data.promotionFromDate &&
        data.promotionToDate
      ) {
        return (
          new Date(data.promotionToDate) > new Date(data.promotionFromDate)
        );
      }
      return true;
    },
    {
      message: "Promotion end date must be after start date",
      path: ["promotionToDate"],
    }
  );


export type ProductFormData = {
  id?: string;
  name: string;
  description: string;
  categoryId: string;
  brandId?: string;
  sku?: string;
  barcode?: string;
  price: number;
  mainImageUrl: string;
  promotionType?: string;
  promotionValue?: number;
  promotionFromDate?: string;
  promotionToDate?: string;
  images?: Array<{
    id?: string;
    imageUrl: string;
  }>;
  sizes?: Array<{
    id?: string;
    name: string;
    barcode?: string;
    sku?: string;
    price: number;
    promotionType?: string;
    promotionValue?: number;
    promotionFromDate?: string;
    promotionToDate?: string;
  }>;
  customizations?: Array<{
    id?: string;
    name: string;
    priceAdjustment?: number;
  }>;
  status: string;
};

export type CreateProductData = z.infer<typeof createProductSchema>;
export type UpdateProductData = z.infer<typeof updateProductSchema>;
export type ImageData = z.infer<typeof imageSchema>;
export type SizeData = z.infer<typeof sizeSchema>;
export type CustomizationData = z.infer<typeof customizationSchema>;
