
import { z } from "zod";

const imageUrlsSchema = z.object({
  sm: z.string().optional(),
  md: z.string().optional(),
  o: z.string().optional(),
});

export const imageSchema = z.object({
  id: z.string().optional(),
  image: imageUrlsSchema.optional(),
});


export const customizationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Customization name is required"),
  priceAdjustment: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ invalid_type_error: "Price adjustment must be a number" }).min(0, "Price adjustment must be zero or positive").optional()
  ),
});


export const sizeSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, "Size name is required"),
    barcode: z.string().nullable().optional(),
    sku: z.string().nullable().optional(),
    price: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
      z.number({ invalid_type_error: "Price must be a number" }).min(0, "Price must be positive")
    ),
    promotionType: z.string().nullable().optional(),
    promotionValue: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
      z.number({ invalid_type_error: "Promotion value must be a number" }).min(0, "Promotion value must be positive").optional()
    ),
    promotionFromDate: z.string().nullable().optional(),
    promotionToDate: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.promotionType && data.promotionType !== "NONE") {
        return data.promotionValue !== undefined && data.promotionValue > 0;
      }
      return true;
    },
    {
      message: "Promotion value is required",
      path: ["promotionValue"],
    }
  )
  .refine(
    (data) => {
      if (data.promotionType && data.promotionType !== "NONE") {
        return Boolean(data.promotionFromDate && data.promotionFromDate !== "");
      }
      return true;
    },
    {
      message: "Start date is required",
      path: ["promotionFromDate"],
    }
  )
  .refine(
    (data) => {
      if (data.promotionType && data.promotionType !== "NONE") {
        return Boolean(data.promotionToDate && data.promotionToDate !== "");
      }
      return true;
    },
    {
      message: "End date is required",
      path: ["promotionToDate"],
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
      message: "End date must be after start date",
      path: ["promotionToDate"],
    }
  );


const baseProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  mainImage: imageUrlsSchema.nullable().optional(),
  hasSizes: z.boolean().optional(),


  price: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ invalid_type_error: "Price must be a number" }).min(0, "Price must be positive").optional()
  ),
  promotionType: z.string().nullable().optional(),
  promotionValue: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ invalid_type_error: "Promotion value must be a number" }).min(0, "Promotion value must be positive").optional()
  ),
  promotionFromDate: z.string().nullable().optional(),
  promotionToDate: z.string().nullable().optional(),

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
        return data.promotionValue !== undefined && data.promotionValue > 0;
      }
      return true;
    },
    {
      message: "Promotion value is required",
      path: ["promotionValue"],
    }
  )
  .refine(
    (data) => {
      if (
        (!data.sizes || data.sizes.length === 0) &&
        data.promotionType &&
        data.promotionType !== "NONE"
      ) {
        return Boolean(data.promotionFromDate && data.promotionFromDate !== "");
      }
      return true;
    },
    {
      message: "Start date is required",
      path: ["promotionFromDate"],
    }
  )
  .refine(
    (data) => {
      if (
        (!data.sizes || data.sizes.length === 0) &&
        data.promotionType &&
        data.promotionType !== "NONE"
      ) {
        return Boolean(data.promotionToDate && data.promotionToDate !== "");
      }
      return true;
    },
    {
      message: "End date is required",
      path: ["promotionToDate"],
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
      message: "End date must be after start date",
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
        return data.promotionValue !== undefined && data.promotionValue > 0;
      }
      return true;
    },
    {
      message: "Promotion value is required",
      path: ["promotionValue"],
    }
  )
  .refine(
    (data) => {
      if (
        (!data.sizes || data.sizes.length === 0) &&
        data.promotionType &&
        data.promotionType !== "NONE"
      ) {
        return Boolean(data.promotionFromDate && data.promotionFromDate !== "");
      }
      return true;
    },
    {
      message: "Start date is required",
      path: ["promotionFromDate"],
    }
  )
  .refine(
    (data) => {
      if (
        (!data.sizes || data.sizes.length === 0) &&
        data.promotionType &&
        data.promotionType !== "NONE"
      ) {
        return Boolean(data.promotionToDate && data.promotionToDate !== "");
      }
      return true;
    },
    {
      message: "End date is required",
      path: ["promotionToDate"],
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
      message: "End date must be after start date",
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
  mainImage?: { sm?: string; md?: string; o?: string };
  promotionType?: string;
  promotionValue?: number;
  promotionFromDate?: string;
  promotionToDate?: string;
  images?: Array<{
    id?: string;
    image?: { sm?: string; md?: string; o?: string };
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
