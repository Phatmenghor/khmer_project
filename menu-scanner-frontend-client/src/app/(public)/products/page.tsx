"use client";

import { ProductListPage } from "@/features/main/components/product/product-list-page";

export default function ProductsPage() {
  return <ProductListPage basePath="/products" scrollKey="products" />;
}
