"use client";

import { useState, useEffect } from "react";
import { TextField } from "@/components/shared/form-field/text-field";
import { CustomTextarea } from "@/components/shared/form-field/custom-textarea";
import { CustomDateTimePicker } from "@/components/shared/common/custom-date-picker";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { showToast } from "@/components/shared/common/show-toast";
import { ReservationInfo } from "@/features/business/store/models/type/table-monitoring-type";
import { Label } from "@/components/ui/label";
import { Calendar, Check } from "lucide-react";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
  initialReservation?: ReservationInfo | null;
  onSaveReservation: (reservation: ReservationInfo) => void;
}

export function ReservationModal({
  isOpen,
  onClose,
  tableNumber,
  initialReservation,
  onSaveReservation,
}: ReservationModalProps) {
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [guestCount, setGuestCount] = useState("2");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (initialReservation) {
      setGuestName(initialReservation.guestName || "");
      setPhone(initialReservation.phone || "");
      setBookingTime(initialReservation.bookingTime || "");
      setGuestCount(initialReservation.guestCount ? String(initialReservation.guestCount) : "2");
      setNotes(initialReservation.notes || "");
    } else {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      setBookingTime(now.toISOString());
      setGuestName("");
      setPhone("");
      setGuestCount("2");
      setNotes("");
    }
  }, [initialReservation, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      showToast.error("Please enter guest name");
      return;
    }

    const parsedCount = parseInt(guestCount, 10) || 1;

    let displayBookingTime = bookingTime;
    try {
      if (bookingTime && !isNaN(Date.parse(bookingTime))) {
        const d = new Date(bookingTime);
        displayBookingTime = `${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (${d.toLocaleDateString()})`;
      }
    } catch {
      displayBookingTime = bookingTime || "Today";
    }

    onSaveReservation({
      guestName: guestName.trim(),
      phone: phone.trim(),
      bookingTime: displayBookingTime,
      guestCount: parsedCount,
      notes: notes.trim(),
    });

    showToast.success(`Reserved Table #${tableNumber} for ${guestName.trim()}`);
    onClose();
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md p-0 overflow-hidden"
    >
      <FormHeader
        title={`Reserve Table #${tableNumber}`}
        subtitle="Select date, time, and customer details for table booking"
        avatarIcon={<Calendar className="w-5 h-5 text-purple-600" />}
        showAvatar
      />

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <TextField
          label="Guest / Customer Name"
          required
          placeholder="e.g. Phat Menghor"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 w-full">
            <Label className="text-[11px] font-extrabold text-foreground leading-tight flex items-center min-h-[16px]">
              <span>Booking Date &amp; Time</span>
              <span className="text-destructive ml-0.5">*</span>
            </Label>
            <CustomDateTimePicker
              mode="datetime"
              value={bookingTime}
              onChange={setBookingTime}
              placeholder="Select date & time"
            />
          </div>

          <TextField
            label="Party Size (Guests)"
            required
            placeholder="e.g. 4"
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
          />
        </div>

        <TextField
          label="Phone Number (Optional)"
          placeholder="e.g. 012 345 678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <CustomTextarea
          label="Special Requests / Notes (Optional)"
          placeholder="High chair, birthday, window seat..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        <div className="pt-4 border-t border-border flex justify-end gap-2">
          <CustomButton type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </CustomButton>
          <CustomButton type="submit" variant="primary" size="sm" className="gap-1 font-bold bg-purple-600 hover:bg-purple-700 text-white">
            <Check className="w-3.5 h-3.5" /> Confirm Reservation
          </CustomButton>
        </div>
      </form>
    </CustomModal>
  );
}
