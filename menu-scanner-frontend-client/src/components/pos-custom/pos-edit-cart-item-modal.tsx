"use client";

import { Messages } from "@/constants/messages";
import { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { SmartImage } from "@/components/shared/image/smart-image";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { CancelButton, CustomButton, SubmitButton } from "@/components/shared/button/custom-button";
import { CustomInput } from "@/components/shared/form-field/custom-input";
import { CustomTextarea } from "@/components/shared/form-field/custom-textarea";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/utils/common/currency-format";
import { PromotionType } from "@/constants/status/status";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { showToast } from "@/components/shared/common/show-toast";

interface CartItemEditData {
  id: string;
  productName: string;
  productImageUrl: string;
  sizeName: string | null;
  originalPrice: number;
  originalQuantity: number;
  originalPromotion: {
    type: string | null;
    value: number | null;
  };
  newPrice: number;
  newQuantity: number;
  newPromotion: {
    type: string | null;
    value: number | null;
  };
  reason: string;
}

interface POSEditCartItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: string;
    productName: string;
    productImageUrl: string;
    sizeName: string | null;
    currentPrice: number;
    quantity: number;
    hasPromotion: boolean | string;
    promotionType: string | null;
    promotionValue: number | null;
    customizations?: Array<{
      name: string;
      priceAdjustment: number;
    }>;
  } | null;
  onSave: (data: CartItemEditData) => void;
}

export function POSEditCartItemModal({
  open,
  onOpenChange,
  item,
  onSave,
}: POSEditCartItemModalProps) {
  const [newPrice, setNewPrice] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [promotionType, setPromotionType] = useState<string | null>(null);
  const [promotionValue, setPromotionValue] = useState("");
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && item) {
      setNewPrice(item.currentPrice.toString());
      setNewQuantity(item.quantity.toString());
      setPromotionType(item.promotionType || null);
      setPromotionValue(item.promotionValue?.toString() || "");
      setReason("");
    }
  }, [open, item]);

  const handleSave = async () => {
    if (!item || !newPrice || !newQuantity) return;

    const qty = parseInt(newQuantity);
    if (qty < 1) {
      showToast.error(Messages.product.minQuantity);
      return;
    }

    setIsSaving(true);
    try {
      const editData: CartItemEditData = {
        id: item.id,
        productName: item.productName,
        productImageUrl: item.productImageUrl,
        sizeName: item.sizeName,
        originalPrice: item.currentPrice,
        originalQuantity: item.quantity,
        originalPromotion: {
          type: item.promotionType,
          value: item.promotionValue,
        },
        newPrice: parseFloat(newPrice) || item.currentPrice,
        newQuantity: qty,
        newPromotion: {
          type: promotionType,
          value: promotionValue ? parseFloat(promotionValue) : null,
        },
        reason: reason.trim(),
      };

      onSave(editData);
      onOpenChange(false);
    } catch (error) {
      showToast.error(Messages.validation.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  if (!item) return null;

  const parsedPrice = newPrice ? parseFloat(newPrice) : item.currentPrice;
  const parsedQuantity = newQuantity ? parseInt(newQuantity) : item.quantity;

  const calculatedFinalPrice = isNaN(parsedPrice) ? item.currentPrice : parsedPrice;
  const calculatedQuantity = isNaN(parsedQuantity) ? item.quantity : Math.max(1, parsedQuantity);

  const addonsTotal = item.customizations && item.customizations.length > 0
    ? item.customizations.reduce((sum, c) => sum + (c.priceAdjustment || 0), 0)
    : 0;

  const priceWithAddons = calculatedFinalPrice + addonsTotal;

  const parsedPromoValue = promotionValue ? parseFloat(promotionValue) : 0;
  const promoDeduction = promotionType && parsedPromoValue > 0
    ? promotionType === PromotionType.PERCENTAGE
      ? calculatedFinalPrice * (parsedPromoValue / 100)
      : parsedPromoValue
    : 0;

  const priceAfterPromo = Math.max(0, priceWithAddons - promoDeduction);
  const calculatedTotal = priceAfterPromo * calculatedQuantity;

  const isDirty = !item ? false : (
    reason.trim() !== "" ||
    newPrice !== (item.currentPrice?.toString() || "") ||
    newQuantity !== (item.quantity?.toString() || "") ||
    promotionType !== (item.promotionType || null) ||
    promotionValue !== (item.promotionValue?.toString() || "")
  );

  const isValid = Boolean(newPrice && newQuantity && parseInt(newQuantity) >= 1);

  return (
    <CustomModal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      size="xl"
      disableScrollWrapper={true}
    >
      <FormHeader
        title="Edit Cart Item"
        description={item.productName}
        isCreate={false}
        showAvatar={false}
      />

      <FormBody className="space-y-4">
        {/* Item Preview Card */}
        <div className="flex gap-3 p-3 bg-muted/30 rounded-[10px] border border-border/80">
          <div className="relative w-14 h-14 rounded-[8px] overflow-hidden bg-background border border-border flex-shrink-0">
            <SmartImage src={item.productImageUrl} alt={item.productName} fill />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-xs text-foreground mb-0.5 truncate">{item.productName}</h4>
            {item.sizeName && (
              <p className="text-[11px] text-muted-foreground font-medium mb-0.5">
                Size: <span className="font-bold text-foreground">{item.sizeName}</span>
              </p>
            )}
            <p className="text-[11px] text-muted-foreground font-medium">
              Original Price: <span className="font-extrabold text-primary">{formatCurrency(item.currentPrice)}</span>
            </p>
          </div>
        </div>

        {/* Add-ons */}
        {item.customizations && item.customizations.length > 0 && (
          <div className="space-y-2 p-3 bg-amber-500/10 rounded-[10px] border border-amber-500/20">
            <h4 className="font-bold text-xs text-amber-700 dark:text-amber-400">Add-ons ({item.customizations.length})</h4>
            <div className="space-y-1">
              {item.customizations.map((custom, idx) => (
                <div key={idx} className="flex justify-between items-center text-[11px]">
                  <span className="text-foreground font-medium">{custom.name}</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">+{formatCurrency(custom.priceAdjustment)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Controls */}
        <div className="space-y-1.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px] font-bold text-muted-foreground mb-1 block">
                Original Qty
              </Label>
              <div className="h-9 px-3 bg-muted/40 rounded-[8px] border border-border/70 text-xs font-bold flex items-center">
                {item.quantity}
              </div>
            </div>
            <div>
              <Label className="text-[11px] font-bold text-foreground mb-1 block">
                New Qty *
              </Label>
              <div className="flex items-center gap-1.5 h-9">
                <CustomButton
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 shrink-0 hover:bg-destructive hover:text-destructive-foreground rounded-[6px]"
                  onClick={() => {
                    const current = parseInt(newQuantity) || 1;
                    if (current > 1) {
                      setNewQuantity((current - 1).toString());
                    }
                  }}
                >
                  <Minus className="h-3.5 w-3.5" />
                </CustomButton>

                <div className="flex-1 text-center h-9 bg-primary/10 text-primary font-black text-xs sm:text-sm rounded-[6px] border border-primary/20 flex items-center justify-center">
                  {newQuantity || item.quantity}
                </div>

                <CustomButton
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 shrink-0 hover:bg-primary hover:text-primary-foreground rounded-[6px]"
                  onClick={() => {
                    const current = parseInt(newQuantity) || item.quantity;
                    setNewQuantity((current + 1).toString());
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                </CustomButton>
              </div>
            </div>
          </div>
        </div>

        {/* Promotion Controls */}
        <div className="space-y-1.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <CustomSelect
                size="md"
                label="Promo Type"
                placeholder="None"
                options={[
                  { value: PromotionType.NONE, label: "None" },
                  { value: PromotionType.PERCENTAGE, label: "Percentage (%)" },
                  { value: PromotionType.FIXED_AMOUNT, label: "Fixed Amount" },
                ]}
                value={promotionType || PromotionType.NONE}
                onValueChange={(value) => setPromotionType(value === PromotionType.NONE ? null : value)}
              />
            </div>
            {promotionType && (
              <div>
                <CustomInput
                  id="promoValue"
                  type="text"
                  inputMode="decimal"
                  label="Promo Value"
                  placeholder={promotionType === PromotionType.PERCENTAGE ? "Enter discount percentage (e.g. 10)..." : "Enter discount amount (e.g. 5.00)..."}
                  value={promotionValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                      setPromotionValue(val);
                    }
                  }}
                  size="md"
                />
              </div>
            )}
          </div>
        </div>

        {/* Price Adjustment */}
        <div className="space-y-1.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px] font-extrabold text-foreground mb-1 block">
                Original Price
              </Label>
              <div className="h-9 px-3 bg-muted/40 rounded-[8px] border border-border/70 text-xs font-bold flex items-center">
                {formatCurrency(item.currentPrice)}
              </div>
            </div>
            <div>
              <CustomInput
                id="newPrice"
                type="text"
                inputMode="decimal"
                label="New Price"
                required
                placeholder="Enter new price..."
                value={newPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                    setNewPrice(val);
                  }
                }}
                size="md"
              />
            </div>
          </div>
        </div>

        {/* Reason for Change */}
        <div className="space-y-1.5">
          <CustomTextarea
            label="Reason for Change (Optional)"
            placeholder="Enter reason for price or quantity adjustment..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
          />
        </div>

        {/* Summary Card */}
        <div className="space-y-2 p-3 bg-muted/20 rounded-[10px] border border-border/80">
          <h4 className="font-black text-xs text-foreground">Summary</h4>
          <div className="space-y-1 text-xs">
            {item.sizeName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Size:</span>
                <span className="font-bold text-foreground">{item.sizeName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">Original Price:</span>
              <span className="font-bold text-foreground">{formatCurrency(calculatedFinalPrice)}</span>
            </div>
            {addonsTotal > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span className="text-muted-foreground font-medium">Add-ons Total:</span>
                <span className="font-bold">+{formatCurrency(addonsTotal)}</span>
              </div>
            )}
            {addonsTotal > 0 && (
              <div className="flex justify-between font-bold border-t border-border/60 pt-1">
                <span className="text-muted-foreground font-medium">Price with Add-ons:</span>
                <span className="text-primary">{formatCurrency(priceWithAddons)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">Quantity:</span>
              <span className="font-bold text-foreground">{calculatedQuantity}</span>
            </div>
            {promotionType && promoDeduction > 0 && (
              <div className="flex justify-between text-destructive">
                <span className="text-muted-foreground font-medium">Promotion:</span>
                <span className="font-bold">
                  -{formatCurrency(promoDeduction)}
                  {promotionType === PromotionType.PERCENTAGE && ` (${promotionValue}%)`}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-border/60 pt-1">
              <span className="text-foreground font-black">Total:</span>
              <span className="text-sm font-black text-primary">
                {formatCurrency(calculatedTotal)}
              </span>
            </div>
          </div>
        </div>
      </FormBody>

      <FormFooter
        isSubmitting={isSaving}
        isDirty={isDirty}
        isCreate={false}
        createMessage="Creating..."
        updateMessage="Saving changes..."
        noChangesMessage="No changes made"
      >
        <CancelButton onClick={() => onOpenChange(false)} disabled={isSaving} />
        <SubmitButton
          onClick={handleSave}
          isSubmitting={isSaving}
          disabled={!isValid}
          isDirty={isDirty}
          isCreate={false}
          updateText="Save Changes"
          submittingUpdateText="Saving..."
        />
      </FormFooter>
    </CustomModal>
  );
}
