"use client";

import { useState, useEffect } from "react";
import { Loader2, Edit } from "lucide-react";
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
    hasActivePromotion: boolean;
    promotionType: string | null;
    promotionValue: number | null;
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

  // Initialize form when modal opens
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

    // Validate quantity is at least 1
    const qty = parseInt(newQuantity);
    if (qty < 1) {
      alert("Quantity must be at least 1");
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
      console.error("Error saving cart item:", error);
      alert("Error saving changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!item) return null;

  // Safe calculations
  const parsedPrice = newPrice ? parseFloat(newPrice) : item.currentPrice;
  const parsedQuantity = newQuantity ? parseInt(newQuantity) : item.quantity;

  const calculatedFinalPrice = isNaN(parsedPrice) ? item.currentPrice : parsedPrice;
  const calculatedQuantity = isNaN(parsedQuantity) ? item.quantity : Math.max(1, parsedQuantity);
  const calculatedTotal = calculatedFinalPrice * calculatedQuantity;

  // Check if form is dirty (with null safety)
  const isDirty = reason.trim() !== "" ||
    newPrice !== item.currentPrice.toString() ||
    newQuantity !== item.quantity.toString() ||
    promotionType !== item.promotionType ||
    (promotionValue !== (item.promotionValue?.toString() || ""));

  const isValid = newPrice && newQuantity && parseInt(newQuantity) >= 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <FormHeader
          title="Edit Cart Item"
          description={item.productName}
          isCreate={false}
          showAvatar={false}
        />

        {/* Body */}
        <FormBody contentClassName="space-y-6">
          {/* Product Info Card */}
          <div className="flex gap-4 p-4 bg-muted/30 rounded-lg border">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white border flex-shrink-0">
              <Image
                src={sanitizeImageUrl(item.productImageUrl, appImages.NoImage)}
                alt={item.productName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">{item.productName}</h4>
              {item.sizeName && (
                <p className="text-xs text-muted-foreground mb-2">
                  Size: <span className="font-medium">{item.sizeName}</span>
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Original Price: <span className="font-semibold text-primary">{formatCurrency(item.currentPrice)}</span>
              </p>
            </div>
          </div>

          {/* Price Section */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Price</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Original Price
                </Label>
                <div className="h-10 p-2.5 bg-muted/50 rounded-lg border text-sm font-semibold flex items-center">
                  {formatCurrency(item.currentPrice)}
                </div>
              </div>
              <div>
                <Label htmlFor="newPrice" className="text-xs text-muted-foreground mb-2 block">
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
                  className="text-sm h-10"
                />
              </div>
            </div>
          </div>

          {/* Promotion Section */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Promotion (Optional)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="promoType" className="text-xs text-muted-foreground mb-2 block">
                  Promotion Type
                </Label>
                <Select value={promotionType || "NONE"} onValueChange={(value) => setPromotionType(value === "NONE" ? null : value)}>
                  <SelectTrigger id="promoType" className="text-sm h-10">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {promotionType && (
                <div>
                  <Label htmlFor="promoValue" className="text-xs text-muted-foreground mb-2 block">
                    Promotion Value
                  </Label>
                  <Input
                    id="promoValue"
                    type="number"
                    placeholder={promotionType === "PERCENTAGE" ? "e.g., 10" : "e.g., 5.00"}
                    value={promotionValue}
                    onChange={(e) => setPromotionValue(e.target.value)}
                    step="0.01"
                    min="0"
                    className="text-sm h-10"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Quantity Section */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Quantity</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Original Quantity
                </Label>
                <div className="h-10 p-2.5 bg-muted/50 rounded-lg border text-sm font-semibold flex items-center">
                  {item.quantity}
                </div>
              </div>
              <div>
                <Label htmlFor="newQuantity" className="text-xs text-muted-foreground mb-2 block">
                  New Quantity * (min 1)
                </Label>
                <Input
                  id="newQuantity"
                  type="number"
                  placeholder="Enter new quantity"
                  value={newQuantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string or values >= 1
                    if (value === "" || parseInt(value) >= 1) {
                      setNewQuantity(value);
                    }
                  }}
                  min="1"
                  className="text-sm h-10"
                />
              </div>
            </div>
          </div>

          {/* Reason Section */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Reason for Change (Optional)</Label>
            <Textarea
              placeholder="e.g., Customer complaint, price adjustment, promotion applied, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="text-sm resize-none h-24"
            />
          </div>

          {/* Summary */}
          <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-semibold text-sm">Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unit Price:</span>
                <span className="font-semibold">{formatCurrency(calculatedFinalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-semibold">{calculatedQuantity}</span>
              </div>
              {promotionType && promotionValue && (
                <div className="flex justify-between text-destructive">
                  <span className="text-muted-foreground">Promotion:</span>
                  <span className="font-semibold">
                    {promotionType === "PERCENTAGE"
                      ? `-${promotionValue}%`
                      : `-${formatCurrency(parseFloat(promotionValue))}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground font-semibold">Total:</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(calculatedTotal)}
                </span>
              </div>
            </div>
          </div>
        </FormBody>

        {/* Footer */}
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
            isLoading={isSaving}
            disabled={!isValid}
            text="Save Changes"
            loadingText="Saving..."
          />
        </FormFooter>
      </DialogContent>
    </Dialog>
  );
}
