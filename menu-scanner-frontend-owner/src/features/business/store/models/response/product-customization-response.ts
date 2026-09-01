export interface ProductCustomizationDto {
  id: string;
  productId: string;
  name: string;
  priceAdjustment: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductCustomizationGroupDto {
  id: string;
  productId: string;
  name: string;
  description?: string;
  isRequired: boolean;
  allowMultiple: boolean;
  sortOrder: number;
  status: string;
  customizations: ProductCustomizationDto[];
  createdAt?: string;
  updatedAt?: string;
}
