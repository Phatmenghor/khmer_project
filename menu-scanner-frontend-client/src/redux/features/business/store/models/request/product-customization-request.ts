export interface ProductCustomizationCreateDto {
  productId: string;
  name: string;
  priceAdjustment: number;
  status?: string;
}

export interface ProductCustomizationUpdateDto {
  id?: string;
  name: string;
  priceAdjustment: number;
  status?: string;
}

export interface ProductCustomizationGroupCreateDto {
  productId: string;
  name: string;
  description?: string;
  isRequired?: boolean;
  allowMultiple?: boolean;
  sortOrder?: number;
  status?: string;
}

export interface ProductCustomizationGroupUpdateDto {
  id?: string;
  name: string;
  description?: string;
  isRequired?: boolean;
  allowMultiple?: boolean;
  sortOrder?: number;
  status?: string;
}

export interface CreateProductWithCustomizationsDto {
  productData: any;
  customizations: ProductCustomizationCreateDto[];
}

export interface UpdateProductWithCustomizationsDto {
  productData: any;
  customizations: ProductCustomizationUpdateDto[];
}
