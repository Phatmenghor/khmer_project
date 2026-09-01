"use client";

import { MapPin } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state/empty-state";

interface LocationEmptyStateProps {
  onAdd: () => void;
}

export function LocationEmptyState({ onAdd }: LocationEmptyStateProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <EmptyState
        icon={MapPin}
        title="No Saved Locations"
        description="Save your favourite delivery spots to make checkout faster."
        action={{
          label: "Add Your First Location",
          onClick: onAdd,
        }}
        size="lg"
      />
    </div>
  );
}
