"use client";

import { Suspense } from "react";
import React from "react";
import { ShoppingCart } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { formatCurrency } from "@/utils/common/currency-format";
import { buildQuantityMap } from "@/utils/common/customization-utils";

import { POSHeaderFilters } from "@/components/pos-custom/pos-header-filters";
import { POSProductGrid } from "@/components/pos-custom/pos-product-grid";
import { POSCartSidebar } from "@/components/pos-custom/pos-cart-sidebar";
import { POSMoreOptionsModal } from "@/components/pos-custom/pos-more-options-modal";
import { POSOrderSuccessModal } from "@/components/pos-custom/pos-order-success-modal";
import { SizePickerModal } from "@/components/shared/modal/size-picker-modal";
import { POSEditCartItemModal } from "@/components/pos-custom/pos-edit-cart-item-modal";
import { BankQrPaymentModal } from "@/components/pos-custom/bank-qr-payment-modal";
import { usePOSPageHandlers } from "@/features/business/hooks/use-pos-page-handlers";
import {
  setShowCart,
  setCustomerNote,
  setSizePickerProduct,
  setEditingCartItemId,
  setSuccessOrder,
  setShowOrderDetailsModal,
} from "@/features/business/store/slice/pos-page-slice";

function PosPageInner() {
  const {
    dispatch,
    selectedDeliveryOption,
    selectedPaymentOption,
    products,
    productsLoading,
    productsError,
    searchTerm,
    selectedCategory,
    selectedBrand,
    hasMoreProducts,
    cartItems,
    showCart,
    customerNote,
    isSubmitting,
    sizePickerProduct,
    editingCartItemId,
    successOrder,
    showOrderDetailsModal,
    promotionFilter,
    promotionOpen,
    minPrice,
    maxPrice,
    editingItemForPrice,
    setEditingItemForPrice,
    showScrollToTop,
    cartSummary,
    showBankQrModal,
    setShowBankQrModal,
    executeOrderCheckout,
    searchInputRef,
    productGridRef,
    posPageRef,
    observerTarget,
    debouncedSearch,
    skeletonCount,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    handleProductClick,
    handleEditPriceItem,
    handleSaveItemChanges,
    handleDiscountApply,
    handleSubmitOrder,
    scrollProductsToTop,
  } = usePOSPageHandlers();

  return (
    <div
      ref={posPageRef}
      className="flex flex-col h-full flex-1 min-h-0 w-full overflow-hidden bg-background"
    >
      <div className="flex max-md:flex-col md:flex-row flex-1 h-full min-h-0 overflow-hidden relative">
        {/* Main Product Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative border-r border-border/60">
          <POSHeaderFilters
            searchInputRef={searchInputRef}
            searchTerm={searchTerm}
            selectedBrand={selectedBrand}
            selectedCategory={selectedCategory}
            promotionOpen={promotionOpen}
            promotionFilter={promotionFilter}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />

          <POSProductGrid
            products={products}
            productsLoading={productsLoading}
            productsError={productsError}
            hasMoreProducts={hasMoreProducts}
            skeletonCount={skeletonCount}
            showScrollToTop={showScrollToTop}
            debouncedSearch={debouncedSearch}
            selectedCategoryId={selectedCategory?.id}
            selectedBrandId={selectedBrand?.id}
            promotionFilter={promotionFilter}
            productGridRef={productGridRef}
            observerTarget={observerTarget}
            handleProductClick={handleProductClick}
            updateQuantity={updateQuantity}
            scrollProductsToTop={scrollProductsToTop}
          />

          {/* Mobile Floating Cart Summary Button */}
          {cartItems.length > 0 && !showCart && (
            <div className="md:hidden fixed bottom-3 left-3 right-3 z-40">
              <CustomButton
                onClick={() => dispatch(setShowCart(true))}
                className="w-full h-12 bg-primary text-primary-foreground rounded-[12px] shadow-xl flex items-center justify-between px-4"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4.5 h-4.5" />
                  <span className="text-xs sm:text-sm font-bold">
                    View Order ({cartSummary.totalQuantity})
                  </span>
                </div>
                <span className="text-sm sm:text-base font-black">
                  {formatCurrency(cartSummary.finalTotal)}
                </span>
              </CustomButton>
            </div>
          )}
        </div>

        {/* Right Cart Sidebar / Checkout Section */}
        <POSCartSidebar
          showCart={showCart}
          cartItems={cartItems}
          cartSummary={cartSummary}
          selectedDeliveryOption={selectedDeliveryOption}
          selectedPaymentOption={selectedPaymentOption}
          isSubmitting={isSubmitting}
          clearCart={clearCart}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
          handleEditPriceItem={handleEditPriceItem}
          handleSubmitOrder={handleSubmitOrder}
        />
      </div>

      {sizePickerProduct && (
        <SizePickerModal
          product={sizePickerProduct}
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              dispatch(setSizePickerProduct(null));
              dispatch(setEditingCartItemId(null));
            }
          }}
          onSizeSelect={(product, size, qty, customizationIds) => {
            addToCart(product, size, editingCartItemId, qty ?? 0, customizationIds);
            dispatch(setSizePickerProduct(null));
            dispatch(setEditingCartItemId(null));
          }}
          isEditing={!!editingCartItemId}
          cartItems={cartItems}
          initialQuantities={
            sizePickerProduct ? buildQuantityMap(cartItems, sizePickerProduct.id) : new Map()
          }
          initialCustomizations={
            editingCartItemId
              ? cartItems
                  .find((item) => item.id === editingCartItemId)
                  ?.customizations?.map((c) => c.productCustomizationId) || []
              : []
          }
        />
      )}

      <POSOrderSuccessModal
        open={!!successOrder}
        onClose={() => dispatch(setSuccessOrder(null))}
        order={successOrder}
      />

      <POSEditCartItemModal
        open={!!editingItemForPrice}
        onOpenChange={(open) => {
          if (!open) setEditingItemForPrice(null);
        }}
        item={
          editingItemForPrice ? {
            id: editingItemForPrice.id,
            productName: editingItemForPrice.productName,
            productImageUrl: editingItemForPrice.productImageUrl,
            sizeName: editingItemForPrice.sizeName,
            currentPrice: editingItemForPrice.currentPrice,
            quantity: editingItemForPrice.quantity,
            hasPromotion: editingItemForPrice.hasPromotion ?? false,
            promotionType: editingItemForPrice.promotionType ?? null,
            promotionValue: editingItemForPrice.promotionValue ?? null,
            customizations: editingItemForPrice.customizations?.map(c => ({
              name: c.name,
              priceAdjustment: c.priceAdjustment,
            })) || [],
          } : null
        }
        onSave={handleSaveItemChanges}
      />

      <POSMoreOptionsModal
        open={showOrderDetailsModal}
        onOpenChange={(open) => dispatch(setShowOrderDetailsModal(open))}
        customerNote={customerNote}
        onNoteChange={(note) => dispatch(setCustomerNote(note))}
        currentOrderTotal={cartSummary.finalTotal}
        onDiscountApply={handleDiscountApply}
      />

      <BankQrPaymentModal
        isOpen={showBankQrModal}
        onClose={() => setShowBankQrModal(false)}
        onConfirmPayment={executeOrderCheckout}
        paymentOptionName={selectedPaymentOption?.name || "Bank Transfer"}
        paymentOptionDescription={selectedPaymentOption?.description}
        qrImageUrl={selectedPaymentOption?.image?.o || selectedPaymentOption?.image?.md || selectedPaymentOption?.image?.sm}
        totalAmount={cartSummary.finalTotal}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default function PosPage() {
  return (
    <Suspense>
      <PosPageInner />
    </Suspense>
  );
}
