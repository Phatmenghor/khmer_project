import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/app-routes/routes";

export default function SizeStockRedirectPage() {
  redirect(`${ROUTES.MANAGE_STOCK.PRODUCTS_STOCK}?tab=size`);
}
