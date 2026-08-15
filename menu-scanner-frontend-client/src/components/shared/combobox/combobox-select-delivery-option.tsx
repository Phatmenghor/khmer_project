"use client";

import { formatCurrency } from "@/utils/common/currency-format";
import { AsyncCombobox } from "@/components/shared/async-combobox";
import { useReduxCombobox } from "@/components/shared/async-combobox/useReduxCombobox";
import { fetchPublicDeliveryOptionsService } from "@/features/master-data/store/thunks/delivery-options-thunks";

interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  price: number;
  [key: string]: unknown;
}

interface ComboboxSelectDeliveryProps {
  dataSelect?: DeliveryOption | null;
  onChangeSelected: (item: DeliveryOption | null) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  businessId?: string;
  statuses?: string[];
}

const FALLBACK_DELIVERY: DeliveryOption[] = [{
  id: "pickup-default",
  name: "Pickup",
  description: "Pickup from store",
  price: 0,
  imageUrl: ""
}];

export function ComboboxSelectDelivery({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label = "Delivery Option",
  required = false,
  placeholder = "Select delivery option...",
  error,
  businessId,
  statuses = ["ACTIVE"],
}: ComboboxSelectDeliveryProps) {
  const controller = useReduxCombobox<DeliveryOption>({
    cacheKey: `deliveryOptions-public-${businessId || "default"}`,
    thunkService: fetchPublicDeliveryOptionsService,
    extraParams: {
      ...(businessId && { businessId }),
      ...(statuses && { statuses }),
    },
    fallbackData: FALLBACK_DELIVERY,
  });

  return (
    <AsyncCombobox<DeliveryOption>
      value={dataSelect}
      onChange={onChangeSelected}
      controller={controller}
      getId={(item) => item?.id ?? ""}
      getLabel={(item) => (!item ? "" : (item.price ?? 0) > 0 ? `${item.name} (+${formatCurrency(item.price)})` : item.name || "")}
      renderItem={(item) => {
        if (!item) return null;
        return (
          <div className="flex items-center justify-between w-full text-xs">
            <span className="truncate line-clamp-1 flex-1">{item.name}</span>
            <span className="text-xs font-semibold text-primary flex-shrink-0 ml-1 whitespace-nowrap">
              +{formatCurrency(item.price || 0)}
            </span>
          </div>
        );
      }}
      label={label}
      required={required}
      placeholder={placeholder}
      searchPlaceholder="Search delivery option..."
      emptyMessage="No delivery option found."
      error={error}
      disabled={disabled}
    />
  );
}
