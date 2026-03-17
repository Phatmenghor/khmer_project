"use client";

import { ProductListPage } from "@/redux/features/main/components/product/product-list-page";

export default function ProductsPage() {
  return <ProductListPage basePath="/products" scrollKey="products" />;
}
