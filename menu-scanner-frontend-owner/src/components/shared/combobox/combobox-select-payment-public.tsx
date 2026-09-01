"use client";

import { AsyncCombobox } from "@/components/shared/async-combobox";
import { useReduxCombobox } from "@/components/shared/async-combobox/useReduxCombobox";
import { fetchPublicPaymentOptionsService } from "@/features/master-data/store/thunks/payment-options-thunks";

interface PaymentOption {
  id: string;
  name: string;
  paymentOptionType: string;
  [key: string]: unknown;
}

interface ComboboxSelectPaymentPublicProps {
  dataSelect?: PaymentOption | null;
  onChangeSelected: (item: PaymentOption | null) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  businessId: string;
  statuses?: string[];
}

export function ComboboxSelectPaymentPublic({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label = "Payment Method",
  required = false,
  placeholder = "Select payment method...",
  error,
  businessId,
  statuses = ["ACTIVE"],
}: ComboboxSelectPaymentPublicProps) {
  const controller = useReduxCombobox<PaymentOption>({
    cacheKey: `paymentOptions_public-${businessId}`,
    thunkService: fetchPublicPaymentOptionsService,
    extraParams: {
      businessId,
      ...(statuses && { statuses }),
    },
  });

  return (
    <AsyncCombobox<PaymentOption>
      value={dataSelect}
      onChange={onChangeSelected}
      controller={controller}
      getId={(item) => item?.id ?? ""}
      getLabel={(item) => item?.name ?? ""}
      renderItem={(item) => {
        if (!item) return null;
        return (
          <div className="flex items-center justify-between w-full text-xs">
            <span className="truncate line-clamp-1 flex-1">{item.name}</span>
          </div>
        );
      }}
      label={label}
      required={required}
      placeholder={placeholder}
      searchPlaceholder="Search payment method..."
      emptyMessage="No method found."
      error={error}
      disabled={disabled}
    />
  );
}
