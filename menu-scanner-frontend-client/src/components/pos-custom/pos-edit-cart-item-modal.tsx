"use client";

import { Messages } from "@/constants/messages";
import { useState, useEffect } from "react";
import { Edit, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/utils/common/currency-format";
import { sanitizeImageUrl } from "@/utils/common/common";
import { appImages } from "@/constants/app-resource/icons/app-images";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
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
    hasPromotion: boolean;
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
    ? promotionType === "PERCENTAGE"
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

  const isValid = newPrice && newQuantity && parseInt(newQuantity) >= 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {}
        <FormHeader
          title="Edit Cart Item"
          description={item.productName}
          isCreate={false}
          showAvatar={false}
        />

        {}
        <FormBody contentClassName="space-y-2">
          {}
          <div className="flex gap-3 p-3 bg-muted/30 rounded border">
            <div className="relative w-14 h-14 rounded overflow-hidden bg-white border flex-shrink-0">
              <Image
                src={sanitizeImageUrl(item.productImageUrl, appImages.NoImage)}
                alt={item.productName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-xs mb-1">{item.productName}</h4>
              {item.sizeName && (
                <p className="text-xs text-muted-foreground mb-1">
                  Size: <span className="font-medium">{item.sizeName}</span>
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Original Price: <span className="font-semibold text-primary">{formatCurrency(item.currentPrice)}</span>
              </p>
            </div>
          </div>

          {}
          {item.customizations && item.customizations.length > 0 && (
            <div className="space-y-2 p-3 bg-yellow-50 rounded border border-yellow-200">
              <h4 className="font-semibold text-xs text-yellow-900">Add-ons ({item.customizations.length})</h4>
              <div className="space-y-1">
                {item.customizations.map((custom, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-yellow-800 font-medium">{custom.name}</span>
                    <span className="text-yellow-700 font-semibold">+{formatCurrency(custom.priceAdjustment)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Original Qty
                </Label>
                <div className="h-7 p-1 bg-muted/50 rounded border text-xs font-semibold flex items-center">
                  {item.quantity}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  New Qty *
                </Label>
                <div className="flex items-center gap-1 h-7">
                  {}
                  <CustomButton
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => {
                      const current = parseInt(newQuantity) || 1;
                      if (current > 1) {
                        setNewQuantity((current - 1).toString());
                      }
                    }}
                  >
                    <Minus className="h-2 w-2" />
                  </CustomButton>

                  {}
                  <div className="flex-1 text-center h-7 bg-primary/10 text-primary font-semibold text-xs rounded border border-primary/20 flex items-center justify-center">
                    {newQuantity || item.quantity}
                  </div>

                  {}
                  <CustomButton
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 shrink-0 hover:bg-primary hover:text-primary-foreground"
                    onClick={() => {
                      const current = parseInt(newQuantity) || item.quantity;
                      setNewQuantity((current + 1).toString());
                    }}
                  >
                    <Plus className="h-2 w-2" />
                  </CustomButton>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="promoType" className="text-xs text-muted-foreground mb-1 block">
                  Promo Type
                </Label>
                <Select value={promotionType || "NONE"} onValueChange={(value) => setPromotionType(value === "NONE" ? null : value)}>
                  <SelectTrigger id="promoType" className="text-xs h-7">
                    <SelectValue placeholder="None">
                      {promotionType === "PERCENTAGE" ? "Percentage (%)" : promotionType === "FIXED_AMOUNT" ? "Fixed Amount" : "None"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {promotionType && (
                <div>
                  <Label htmlFor="promoValue" className="text-xs text-muted-foreground mb-1 block">
                    Promo Value
                  </Label>
                  <Input
                    id="promoValue"
                    type="number"
                    placeholder={promotionType === "PERCENTAGE" ? "e.g., 10" : "e.g., 5.00"}
                    value={promotionValue}
                    onChange={(e) => setPromotionValue(e.target.value)}
                    step="0.01"
                    min="0"
                    className="text-xs h-7"
                  />
                </div>
              )}
            </div>
          </div>

          {}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Original Price
                </Label>
                <div className="h-7 p-1 bg-muted/50 rounded border text-xs font-semibold flex items-center">
                  {formatCurrency(item.currentPrice)}
                </div>
              </div>
              <div>
                <Label htmlFor="newPrice" className="text-xs text-muted-foreground mb-1 block">
                  New Price *
                </Label>
                <Input
                  id="newPrice"
                  type="number"
                  placeholder="Enter new price"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  step="0.01"
                  min="0"
                  className="text-xs h-7"
                />
              </div>
            </div>
          </div>

          {}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Reason for Change (Optional)</Label>
            <Textarea
              placeholder="e.g., Customer complaint, price adjustment, promotion applied, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="text-xs resize-none h-16"
            />
          </div>

          {}
          <div className="space-y-2 p-3 bg-primary/5 rounded border border-primary/20">
            <h4 className="font-semibold text-xs">Summary</h4>
            <div className="space-y-1 text-xs">
              {item.sizeName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-semibold">{item.sizeName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original Price:</span>
                <span className="font-semibold">{formatCurrency(calculatedFinalPrice)}</span>
              </div>
              {addonsTotal > 0 && (
                <div className="flex justify-between text-green-700">
                  <span className="text-muted-foreground">Add-ons Total:</span>
                  <span className="font-semibold">+{formatCurrency(addonsTotal)}</span>
                </div>
              )}
              {addonsTotal > 0 && (
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span className="text-muted-foreground">Price with Add-ons:</span>
                  <span className="text-primary">{formatCurrency(priceWithAddons)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-semibold">{calculatedQuantity}</span>
              </div>
              {promotionType && promoDeduction > 0 && (
                <div className="flex justify-between text-destructive">
                  <span className="text-muted-foreground">Promotion:</span>
                  <span className="font-semibold">
                    -{formatCurrency(promoDeduction)}
                    {promotionType === "PERCENTAGE" && ` (${promotionValue}%)`}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-1">
                <span className="text-muted-foreground font-semibold">Total:</span>
                <span className="text-sm font-bold text-primary">
                  {formatCurrency(calculatedTotal)}
                </span>
              </div>
            </div>
          </div>
        </FormBody>

        {}
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
      </DialogContent>
    </Dialog>
  );
}
