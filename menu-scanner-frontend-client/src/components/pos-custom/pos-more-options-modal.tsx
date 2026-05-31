"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Loader2, Settings2 } from "lucide-react";

interface POSMoreOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerNote: string;
  onNoteChange: (note: string) => void;
}

export function POSMoreOptionsModal({
  open,
  onOpenChange,
  customerNote,
  onNoteChange,
}: POSMoreOptionsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onOpenChange(false);
      setIsSubmitting(false);
    }, 300);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[400px] p-0 gap-0">
        <DialogTitle className="sr-only">Order Options</DialogTitle>

        <div className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg shrink-0">
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <h2 className="text-lg font-semibold text-slate-900">Order Options</h2>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-900 block">Order Note</label>
            <Textarea
              value={customerNote}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Special instructions..."
              rows={2}
              maxLength={100}
              className="text-xs resize-none border-slate-200 focus:border-primary"
            />
            <div className="flex justify-end">
              <span className="text-xs text-muted-foreground">{customerNote.length} / 100</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t bg-slate-50 flex gap-2.5">
          <CustomButton
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-sm font-medium border-slate-300 hover:bg-slate-100 text-slate-700"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </CustomButton>
          <CustomButton
            size="sm"
            className="flex-1 h-9 text-sm font-medium bg-primary hover:bg-primary/95 text-white shadow-sm"
            onClick={handleApply}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Saving
              </>
            ) : (
              <span>Apply</span>
            )}
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
