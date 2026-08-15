"use client";

import { User, Phone, MessageSquare } from "lucide-react";
import { CustomInput, CustomTextarea } from "@/components/shared";
import { ComboboxSelectLocation } from "@/components/shared/combobox/combobox-select-location";
import { Messages } from "@/constants/messages";
import { OrderContext } from "@/utils/order/order-context";

interface CheckoutCustomerSectionProps {
  orderContext: OrderContext;
  isAuthenticated: boolean;
  selectedAddress: any;
  defaultAddress: any;
  selectedAddressId: string | null;
  onAddressSelect: (id: string) => void;
  customerName: string;
  customerPhone: string;
  customerNote: string;
  onNameChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  onNoteChange: (val: string) => void;
  onSignInClick: () => void;
}

export function CheckoutCustomerSection({
  orderContext,
  isAuthenticated,
  selectedAddress,
  defaultAddress,
  selectedAddressId,
  onAddressSelect,
  customerName,
  customerPhone,
  customerNote,
  onNameChange,
  onPhoneChange,
  onNoteChange,
  onSignInClick,
}: CheckoutCustomerSectionProps) {
  // If Table Order: Contact & Location are hidden! Only Special Instructions shown.
  if (orderContext.isTable) {
    return (
      <div className="bg-card border border-border/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
        <CustomTextarea
          label="Special Instructions for Kitchen / Chef"
          leftIcon={<MessageSquare className="h-3.5 w-3.5 text-amber-500" />}
          value={customerNote}
          onChange={(e) => onNoteChange(e.target.value.slice(0, 500))}
          placeholder="e.g. Less spicy, no onions, extra ice..."
          maxLength={500}
          showCount
          rows={3}
        />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-2xs">
      {/* Delivery Address Section (For Authenticated Users) */}
      {isAuthenticated ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1">
            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <User className="h-3.5 w-3.5 text-primary" />
              Delivery Location
            </span>
          </div>

          <ComboboxSelectLocation
            dataSelect={selectedAddress as any}
            onChangeSelected={(item) => {
              if (item) onAddressSelect(item.id);
            }}
            placeholder="Select your delivery address..."
            hasDefault={!!defaultAddress}
            error={!selectedAddressId ? Messages.delivery.selectAddress : ""}
            label=""
          />
        </div>
      ) : (
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <User className="h-3.5 w-3.5 text-blue-500" />
            Customer Information
          </span>
          <button
            type="button"
            onClick={onSignInClick}
            className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
          >
            Have an account? Sign in
          </button>
        </div>
      )}

      {/* Contact Inputs */}
      <div className="space-y-2.5 pt-1">
        <div className="grid sm:grid-cols-2 gap-2.5">
          <CustomInput
            label="Full Name"
            required
            leftIcon={<User className="h-3.5 w-3.5 text-muted-foreground" />}
            value={customerName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Your full name"
            size="sm"
          />

          <CustomInput
            label="Phone Number"
            required
            type="tel"
            leftIcon={<Phone className="h-3.5 w-3.5 text-muted-foreground" />}
            value={customerPhone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="Your phone number"
            size="sm"
          />
        </div>
      </div>

      {/* Special Instructions */}
      <div className="pt-2 border-t border-border/40">
        <CustomTextarea
          label="Special Instructions"
          leftIcon={<MessageSquare className="h-3.5 w-3.5 text-amber-500" />}
          value={customerNote}
          onChange={(e) => onNoteChange(e.target.value.slice(0, 500))}
          placeholder="Add any special requests or delivery notes for your order..."
          maxLength={500}
          showCount
          rows={2}
        />
      </div>
    </div>
  );
}
