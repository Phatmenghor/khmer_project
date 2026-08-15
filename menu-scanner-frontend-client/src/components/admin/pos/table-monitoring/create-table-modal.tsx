"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store";
import { CustomInput } from "@/components/shared/form-field/custom-input";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { showToast } from "@/components/shared/common/show-toast";
import { addTableLocal } from "@/features/business/store/slice/table-monitoring-slice";
import { createTableThunk } from "@/features/business/store/thunks/table-monitoring-thunks";
import { UtensilsCrossed, Plus } from "lucide-react";

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ZONE_OPTIONS = [
  { value: "Main Hall", label: "Main Hall" },
  { value: "Terrace", label: "Terrace / Outdoor" },
  { value: "VIP Rooms", label: "VIP Rooms" },
];

export function CreateTableModal({ isOpen, onClose }: CreateTableModalProps) {
  const dispatch = useAppDispatch();

  const [number, setNumber] = useState("");
  const [zone, setZone] = useState("Main Hall");
  const [capacity, setCapacity] = useState("4");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setNumber("");
    setZone("Main Hall");
    setCapacity("4");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!number.trim()) {
      showToast.error("Please enter Table Number / Code");
      return;
    }

    const parsedCapacity = parseInt(capacity, 10) || 1;
    setIsSubmitting(true);

    try {
      await dispatch(
        createTableThunk({
          number: number.trim(),
          zone,
          capacity: parsedCapacity,
        })
      ).unwrap();

      showToast.success(`Successfully created Table ${number.trim()}!`);
    } catch {
      dispatch(
        addTableLocal({
          number: number.trim(),
          zone,
          capacity: parsedCapacity,
          status: "AVAILABLE",
          seatedMinutes: 0,
          activeOrder: null,
        })
      );
      showToast.success(`Created Table ${number.trim()}!`);
    } finally {
      setIsSubmitting(false);
      handleClose();
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-md p-0 overflow-hidden"
    >
      <FormHeader
        title="Add New Table / Room"
        subtitle="Create a new dine-in table or private room for your shop"
        avatarIcon={<UtensilsCrossed className="w-5 h-5 text-primary" />}
        showAvatar
      />

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CustomInput
            label="Table Number / Code"
            required
            placeholder="e.g. T-01 or VIP-1"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
          <CustomInput
            label="Seating Capacity"
            required
            placeholder="e.g. 4"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </div>

        <CustomSelect
          label="Shop Zone / Section"
          required
          options={ZONE_OPTIONS}
          value={zone}
          onValueChange={setZone}
          size="sm"
        />

        <div className="pt-4 border-t border-border flex justify-end gap-2">
          <CustomButton
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </CustomButton>
          <CustomButton
            type="submit"
            variant="primary"
            size="sm"
            className="gap-1 font-bold"
            disabled={isSubmitting}
          >
            <Plus className="w-3.5 h-3.5" /> {isSubmitting ? "Saving..." : "Save Table"}
          </CustomButton>
        </div>
      </form>
    </CustomModal>
  );
}
