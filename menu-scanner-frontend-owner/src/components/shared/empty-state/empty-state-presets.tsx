


import {
  PackageOpen,
  Search,
  Filter,
  ShoppingCart,
  Heart,
  FileText,
  Inbox,
  UserX,
  ImageOff,
  AlertCircle,
  DatabaseZap,
} from "lucide-react";
import { EmptyState, EmptyStateProps } from "./empty-state";

type PresetConfig = Omit<EmptyStateProps, "action" | "secondaryAction">;


export const EmptyStatePresets = {

  noData: {
    icon: DatabaseZap,
    title: "No data available",
    description: "There is no data to display at this time",
  } as PresetConfig,


  noSearchResults: {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search terms or filters",
  } as PresetConfig,


  noFilterResults: {
    icon: Filter,
    title: "No matching items",
    description: "No items match your current filters",
  } as PresetConfig,


  noProducts: {
    icon: PackageOpen,
    title: "No products found",
    description: "There are no products available at this time",
  } as PresetConfig,


  emptyCart: {
    icon: ShoppingCart,
    title: "Your cart is empty",
    description: "Add some products to get started",
  } as PresetConfig,


  emptyWishlist: {
    icon: Heart,
    title: "Your wishlist is empty",
    description: "Save your favorite items to your wishlist",
  } as PresetConfig,


  noOrders: {
    icon: FileText,
    title: "No orders yet",
    description: "You haven't placed any orders",
  } as PresetConfig,


  emptyInbox: {
    icon: Inbox,
    title: "No messages",
    description: "Your inbox is empty",
  } as PresetConfig,


  noUsers: {
    icon: UserX,
    title: "No users found",
    description: "No users match your search criteria",
  } as PresetConfig,


  noImages: {
    icon: ImageOff,
    title: "No images",
    description: "No images have been uploaded yet",
  } as PresetConfig,


  error: {
    icon: AlertCircle,
    title: "Something went wrong",
    description: "We couldn't load the data. Please try again",
  } as PresetConfig,


  noBrands: {
    icon: PackageOpen,
    title: "No brands found",
    description: "Create your first brand to get started",
  } as PresetConfig,

  noCategories: {
    icon: PackageOpen,
    title: "No categories found",
    description: "Create your first category to organize products",
  } as PresetConfig,

  noBanners: {
    icon: ImageOff,
    title: "No banners found",
    description: "Create your first banner for the homepage",
  } as PresetConfig,
};


export function createEmptyState(
  preset: keyof typeof EmptyStatePresets,
  overrides?: Partial<EmptyStateProps>
): EmptyStateProps {
  return {
    ...EmptyStatePresets[preset],
    ...overrides,
  };
}
